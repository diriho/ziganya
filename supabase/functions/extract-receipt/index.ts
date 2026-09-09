// Supabase Edge Function: extract structured transaction data from a receipt image or PDF.
//
// Deploy:   supabase functions deploy extract-receipt --project-ref <ref>
// Secrets:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-... [ANTHROPIC_MODEL=claude-opus-5] [ANTHROPIC_EFFORT=medium]
//
// The client uploads the file to the `receipts` bucket first, then calls this function with the
// storage path. The function verifies the caller's JWT, downloads the file with the caller's own
// permissions (RLS enforced), asks Claude for a schema-validated extraction, maps the category to
// one of the user's categories, and records the result on the `uploads` row.

import Anthropic from "npm:@anthropic-ai/sdk";
import { zodOutputFormat } from "npm:@anthropic-ai/sdk/helpers/zod";
import { z } from "npm:zod";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const PDF_TYPE = "application/pdf";
const MAX_BYTES = 20 * 1024 * 1024;
const EFFORTS = new Set(["low", "medium", "high", "xhigh", "max"]);

const ReceiptSchema = z.object({
  is_receipt: z.boolean(),
  merchant_name: z.string().nullable(),
  amount: z.number().nullable(),
  currency: z.string().nullable(),
  transaction_date: z.string().nullable(),
  category: z.string().nullable(),
  payment_method: z.string().nullable(),
  items: z.array(z.object({ name: z.string(), amount: z.number().nullable() })),
  confidence: z.number(),
  uncertain_fields: z.array(z.string()),
  notes: z.string().nullable(),
});

const SYSTEM_PROMPT = `You extract structured data from a single receipt, invoice, or payment confirmation for a personal-finance app. Fill every field of the schema.

Rules:
- amount: the final total the customer actually paid, after tax, tip and discounts. If several totals appear, prefer the one labeled Total, Amount Due, Paid, or Charged. Never sum line items yourself if a printed total exists.
- currency: ISO 4217 code inferred from symbols, language, or address. If it cannot be determined, use the default currency given in the message.
- transaction_date: the purchase date in YYYY-MM-DD. If the year is missing, choose the most recent occurrence that is not after today's date given in the message. If no date is visible, return null.
- merchant_name: the business name as printed, in normal title case, without slogans, store numbers, or addresses.
- category: exactly one name from the provided category list, or null if none fits.
- items: up to 20 line items with their prices (null if unreadable). Skip subtotal/tax/total rows.
- payment_method: e.g. "Visa •••• 4021", "Cash", "Apple Pay", or null.
- confidence: 0 to 1 for the whole extraction. Put any field that is blurry, cut off, or ambiguous in uncertain_fields (use the schema field names).
- If the image is not a receipt, invoice, or payment record, set is_receipt to false and every other nullable field to null.
Do not invent values. Null is always better than a guess.`;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function guessMediaType(path: string, fallback: string): string {
  const ext = path.toLowerCase().split(".").pop() ?? "";
  const map: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", pdf: PDF_TYPE };
  return map[ext] ?? fallback;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) return json({ error: "Receipt scanning is not configured: set the ANTHROPIC_API_KEY secret." }, 500);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return json({ error: "Not signed in." }, 401);

  let body: { path?: string; uploadId?: string; defaultCurrency?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const path = body.path?.trim();
  if (!path) return json({ error: "Missing storage path." }, 400);
  if (!path.startsWith(`${user.id}/`)) return json({ error: "You can only scan your own receipts." }, 403);

  const markUpload = async (fields: Record<string, unknown>) => {
    if (!body.uploadId) return;
    await supabase.from("uploads").update(fields).eq("id", body.uploadId).eq("user_id", user.id);
  };

  // Download the file with the caller's permissions.
  const { data: blob, error: downloadError } = await supabase.storage.from("receipts").download(path);
  if (downloadError || !blob) {
    await markUpload({ status: "failed", error_message: "File not found in storage." });
    return json({ error: "Could not read the uploaded file." }, 404);
  }
  if (blob.size > MAX_BYTES) {
    await markUpload({ status: "failed", error_message: "File too large." });
    return json({ error: "File is too large to scan (max 20 MB)." }, 413);
  }

  const mediaType = blob.type && blob.type !== "application/octet-stream" ? blob.type : guessMediaType(path, "");
  const isPdf = mediaType === PDF_TYPE;
  if (!isPdf && !IMAGE_TYPES.has(mediaType)) {
    await markUpload({ status: "failed", error_message: `Unsupported type ${mediaType || "unknown"}.` });
    return json({ error: `Unsupported file type (${mediaType || "unknown"}). Use JPEG, PNG, WebP or PDF; HEIC photos need converting first.` }, 415);
  }

  const data = toBase64(new Uint8Array(await blob.arrayBuffer()));

  // The user's categories (defaults + their own) so the model picks a real one.
  const { data: categories } = await supabase
    .from("categories")
    .select("id,name")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("name");
  const categoryList = (categories ?? []) as Array<{ id: string; name: string }>;

  const today = new Date().toISOString().slice(0, 10);
  const defaultCurrency = (body.defaultCurrency ?? "USD").toUpperCase();
  const model = Deno.env.get("ANTHROPIC_MODEL") ?? "claude-opus-5";
  const effortEnv = Deno.env.get("ANTHROPIC_EFFORT") ?? "medium";
  const effort = (EFFORTS.has(effortEnv) ? effortEnv : "medium") as "low" | "medium" | "high" | "xhigh" | "max";

  const mediaBlock: Anthropic.ContentBlockParam = isPdf
    ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
    : { type: "image", source: { type: "base64", media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif", data } };

  const userText = [
    `Today's date: ${today}.`,
    `Default currency if ambiguous: ${defaultCurrency}.`,
    categoryList.length ? `Categories to choose from: ${categoryList.map((c) => c.name).join(", ")}.` : "No categories are defined; return null for category.",
    "Extract the receipt.",
  ].join("\n");

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.parse({
      model,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      output_config: { format: zodOutputFormat(ReceiptSchema), effort },
      messages: [{ role: "user", content: [mediaBlock, { type: "text", text: userText }] }],
    });

    if (response.stop_reason === "refusal") {
      await markUpload({ status: "failed", error_message: "Declined by the model." });
      return json({ error: "The scanner declined to read this file." }, 422);
    }

    const parsed = response.parsed_output;
    if (!parsed) {
      await markUpload({ status: "failed", error_message: "Unparseable model output." });
      return json({ error: "Could not read the receipt. Try a sharper photo." }, 502);
    }

    const wanted = (parsed.category ?? "").trim().toLowerCase();
    const category =
      categoryList.find((c) => c.name.toLowerCase() === wanted) ??
      (wanted ? categoryList.find((c) => c.name.toLowerCase().includes(wanted) || wanted.includes(c.name.toLowerCase())) : undefined);

    const extraction = { ...parsed, category: category?.name ?? parsed.category, category_id: category?.id ?? null };

    await markUpload({
      status: "processed",
      error_message: null,
      raw_text: JSON.stringify({ extraction, model: response.model, extracted_at: new Date().toISOString() }),
    });

    return json({
      extraction,
      model: response.model,
      usage: { input_tokens: response.usage.input_tokens, output_tokens: response.usage.output_tokens },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await markUpload({ status: "failed", error_message: message.slice(0, 500) });

    if (err instanceof Anthropic.AuthenticationError) return json({ error: "Receipt scanning is misconfigured (invalid ANTHROPIC_API_KEY)." }, 500);
    if (err instanceof Anthropic.RateLimitError) return json({ error: "The scanner is busy right now. Try again in a moment." }, 429);
    if (err instanceof Anthropic.BadRequestError) return json({ error: `The file could not be processed: ${message}` }, 400);
    if (err instanceof Anthropic.APIError) return json({ error: "The scanning service returned an error. Try again." }, 502);
    return json({ error: message }, 500);
  }
});
