/**
 * Receipt scanning: compress → upload to storage → ask the `extract-receipt`
 * Edge Function for structured fields → user reviews → transaction saved.
 */
import { FunctionsHttpError } from "@supabase/supabase-js";
import { dbClient, type Upload } from "../db";
import { normalizeExtraction, type ReceiptExtraction, type ReceiptExtractionRaw } from "./normalize";
import { ImageDecodeError, NATIVE_OCR_TYPES, UNREADABLE_IMAGE_MESSAGE, decodeImage, effectiveMimeType, isHeicLike, renderBitmap } from "./image";

export * from "./normalize";
export * from "./engines";
export * from "./parseReceiptText";
export * from "./image";

export const MAX_RECEIPT_EDGE_PX = 1600;
const COMPRESS_ABOVE_BYTES = 700 * 1024;

/**
 * Prepare the copy that gets stored and sent to the cloud reader: HEIC becomes
 * JPEG (neither the AI reader nor OCR can read HEIC), and large photos are
 * downscaled to ~1600px JPEG. Small JPEG/PNG/WebP files and PDFs pass through.
 * Throws an ImageDecodeError when the browser cannot decode the photo at all.
 */
export async function prepareReceiptFile(file: File): Promise<File> {
  const mime = effectiveMimeType(file);
  if (mime === "application/pdf") return file;
  const heic = isHeicLike(file);
  if (!heic && file.size < COMPRESS_ABOVE_BYTES && NATIVE_OCR_TYPES.includes(mime)) return file;

  const bitmap = await decodeImage(file);
  if (!bitmap) {
    if (heic || !NATIVE_OCR_TYPES.includes(mime)) throw new ImageDecodeError(UNREADABLE_IMAGE_MESSAGE);
    return file; // browser can't draw it, but the format itself is fine
  }
  try {
    const blob = await renderBitmap(bitmap, { maxEdge: MAX_RECEIPT_EDGE_PX, type: "image/jpeg", quality: 0.85 });
    if (!blob) return heic ? Promise.reject(new ImageDecodeError(UNREADABLE_IMAGE_MESSAGE)) : file;
    if (!heic && blob.size >= file.size && NATIVE_OCR_TYPES.includes(mime)) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "receipt";
    return new File([blob], `${base}.jpg`, { type: "image/jpeg", lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}

interface ExtractResponse {
  extraction: ReceiptExtractionRaw;
  model?: string;
  usage?: { input_tokens: number; output_tokens: number };
}

export interface ExtractReceiptInput {
  /** Storage path inside the `receipts` bucket (must belong to the current user). */
  path: string;
  uploadId?: string;
  defaultCurrency?: string;
  categories?: Array<{ id: string; name: string }>;
}

function friendlyFunctionError(message: string, status?: number): string {
  const m = message.toLowerCase();
  if (status === 404 || m.includes("not found") && m.includes("function")) {
    return "Receipt scanning isn't deployed yet. Deploy the extract-receipt Edge Function (see README).";
  }
  if (m.includes("anthropic_api_key")) return "Receipt scanning isn't configured on the server yet (missing API key).";
  if (m.includes("failed to send") || m.includes("fetch")) return "Couldn't reach the scanning service. Check your connection and try again.";
  return message;
}

/** Call the Edge Function and return a validated extraction. */
export async function extractReceipt(input: ExtractReceiptInput): Promise<ReceiptExtraction> {
  const { data, error } = await dbClient.functions.invoke<ExtractResponse>("extract-receipt", {
    body: { path: input.path, uploadId: input.uploadId, defaultCurrency: input.defaultCurrency },
  });

  if (error) {
    let message = error.message || "Receipt scanning failed.";
    let status: number | undefined;
    if (error instanceof FunctionsHttpError) {
      const response = error.context as Response | undefined;
      status = response?.status;
      try {
        const payload = (await response?.json()) as { error?: string; message?: string } | undefined;
        message = payload?.error ?? payload?.message ?? message;
      } catch {
        /* non-JSON error body */
      }
    }
    throw new Error(friendlyFunctionError(message, status));
  }
  if (!data?.extraction) throw new Error("The scanner returned no data. Try again.");

  return normalizeExtraction(data.extraction, { defaultCurrency: input.defaultCurrency, categories: input.categories });
}

/** Record which transaction a scanned receipt became (kept in the upload's raw_text JSON). */
export async function linkReceiptToTransaction(userId: string, upload: Upload, transactionId: string, extraction: ReceiptExtraction): Promise<void> {
  let previous: Record<string, unknown> = {};
  try {
    previous = upload.raw_text ? (JSON.parse(upload.raw_text) as Record<string, unknown>) : {};
  } catch {
    previous = { raw_text: upload.raw_text };
  }
  const { error } = await dbClient
    .from("uploads")
    .update({
      status: "processed",
      error_message: null,
      raw_text: JSON.stringify({ ...previous, transaction_id: transactionId, confirmed: extraction, confirmed_at: new Date().toISOString() }),
    })
    .eq("id", upload.id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function setUploadStatus(userId: string, uploadId: string, status: "pending" | "processing" | "processed" | "failed" | "discarded", errorMessage: string | null = null): Promise<void> {
  await dbClient.from("uploads").update({ status, error_message: errorMessage }).eq("id", uploadId).eq("user_id", userId);
}

/** Persist an on-device OCR result on the upload row (mirrors what the Edge Function stores). */
export async function recordDeviceExtraction(
  userId: string,
  uploadId: string,
  payload: { text: string; ocrConfidence: number; extraction: ReceiptExtractionRaw }
): Promise<void> {
  await dbClient
    .from("uploads")
    .update({
      status: "processed",
      error_message: null,
      raw_text: JSON.stringify({
        engine: "device",
        ocr_confidence: payload.ocrConfidence,
        text: payload.text.slice(0, 6000),
        extraction: payload.extraction,
        extracted_at: new Date().toISOString(),
      }),
    })
    .eq("id", uploadId)
    .eq("user_id", userId);
}
