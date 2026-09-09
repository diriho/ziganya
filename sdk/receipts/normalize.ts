/**
 * Pure validation of what the extraction service returns. Anything that fails a
 * sanity check becomes null and is added to `uncertainFields` so the review form
 * highlights it instead of silently saving a wrong value.
 */

export interface ReceiptItem {
  name: string;
  amount: number | null;
}

/** Wire shape from the Edge Function (or mock). Everything is optional/loose on purpose. */
export interface ReceiptExtractionRaw {
  is_receipt?: boolean | null;
  merchant_name?: string | null;
  amount?: number | string | null;
  currency?: string | null;
  transaction_date?: string | null;
  category?: string | null;
  category_id?: string | null;
  payment_method?: string | null;
  items?: Array<{ name?: string | null; amount?: number | string | null }> | null;
  confidence?: number | string | null;
  uncertain_fields?: string[] | null;
  notes?: string | null;
}

export interface ReceiptExtraction {
  isReceipt: boolean;
  merchantName: string | null;
  amount: number | null;
  currency: string;
  transactionDate: string | null;
  categoryName: string | null;
  categoryId: string | null;
  paymentMethod: string | null;
  items: ReceiptItem[];
  /** 0..1 */
  confidence: number;
  /** Subset of REVIEWABLE_FIELDS the user should double-check. */
  uncertainFields: ReviewableField[];
  notes: string | null;
}

export const REVIEWABLE_FIELDS = ["merchant_name", "amount", "currency", "transaction_date", "category"] as const;
export type ReviewableField = (typeof REVIEWABLE_FIELDS)[number];

export interface NormalizeOptions {
  today?: Date;
  defaultCurrency?: string;
  categories?: Array<{ id: string; name: string }>;
}

const isReviewable = (f: string): f is ReviewableField => (REVIEWABLE_FIELDS as readonly string[]).includes(f);

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.,-]/g, "").replace(/,(?=\d{3}(\D|$))/g, "").replace(",", ".");
    const n = Number(cleaned);
    return cleaned && Number.isFinite(n) ? n : null;
  }
  return null;
}

function localKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function validDateKey(value: string | null | undefined, today: Date): string | null {
  if (!value) return null;
  const key = String(value).trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (dt > tomorrow) return null; // receipts from the future are misreads
  if (y < 2000) return null;
  return localKey(dt);
}

export function normalizeExtraction(raw: ReceiptExtractionRaw | null | undefined, options: NormalizeOptions = {}): ReceiptExtraction {
  const today = options.today ?? new Date();
  const defaultCurrency = (options.defaultCurrency ?? "USD").toUpperCase();
  const r = raw ?? {};
  const uncertain = new Set<ReviewableField>((r.uncertain_fields ?? []).map((f) => String(f).trim()).filter(isReviewable));

  const merchantName = typeof r.merchant_name === "string" && r.merchant_name.trim() ? r.merchant_name.trim().slice(0, 120) : null;
  if (!merchantName) uncertain.add("merchant_name");

  let amount = toNumber(r.amount);
  if (amount !== null) amount = Math.round(Math.abs(amount) * 100) / 100;
  if (amount === null || amount <= 0) {
    amount = null;
    uncertain.add("amount");
  }

  const currencyRaw = typeof r.currency === "string" ? r.currency.trim().toUpperCase() : "";
  const currency = /^[A-Z]{3}$/.test(currencyRaw) ? currencyRaw : defaultCurrency;
  if (!/^[A-Z]{3}$/.test(currencyRaw)) uncertain.add("currency");

  const transactionDate = validDateKey(r.transaction_date, today);
  if (!transactionDate) uncertain.add("transaction_date");

  const categoryName = typeof r.category === "string" && r.category.trim() ? r.category.trim() : null;
  let categoryId: string | null = null;
  if (options.categories) {
    const byId = r.category_id ? options.categories.find((c) => c.id === r.category_id) : undefined;
    const byName = categoryName ? options.categories.find((c) => c.name.toLowerCase() === categoryName.toLowerCase()) : undefined;
    categoryId = (byId ?? byName)?.id ?? null;
  } else {
    categoryId = typeof r.category_id === "string" && r.category_id ? r.category_id : null;
  }
  if (!categoryId) uncertain.add("category");

  const confidenceRaw = toNumber(r.confidence);
  const confidence = confidenceRaw === null ? 0.5 : Math.max(0, Math.min(1, confidenceRaw > 1 ? confidenceRaw / 100 : confidenceRaw));

  const items: ReceiptItem[] = (Array.isArray(r.items) ? r.items : [])
    .map((it) => ({ name: String(it?.name ?? "").trim().slice(0, 80), amount: toNumber(it?.amount) }))
    .filter((it) => it.name.length > 0)
    .slice(0, 20)
    .map((it) => ({ ...it, amount: it.amount === null ? null : Math.round(Math.abs(it.amount) * 100) / 100 }));

  return {
    isReceipt: r.is_receipt !== false,
    merchantName,
    amount,
    currency,
    transactionDate,
    categoryName,
    categoryId,
    paymentMethod: typeof r.payment_method === "string" && r.payment_method.trim() ? r.payment_method.trim().slice(0, 60) : null,
    items,
    confidence,
    uncertainFields: REVIEWABLE_FIELDS.filter((f) => uncertain.has(f)),
    notes: typeof r.notes === "string" && r.notes.trim() ? r.notes.trim().slice(0, 500) : null,
  };
}

/** Human label for a reviewable field. */
export const FIELD_LABELS: Record<ReviewableField, string> = {
  merchant_name: "Merchant",
  amount: "Amount",
  currency: "Currency",
  transaction_date: "Date",
  category: "Category",
};
