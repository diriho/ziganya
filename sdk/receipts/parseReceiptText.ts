/**
 * Rule-based receipt parser for on-device OCR text. Pure and deterministic so it
 * can be unit-tested; the output goes through `normalizeExtraction` like the
 * cloud engine's result, so both engines feed the same review form.
 */
import type { ReceiptExtractionRaw } from "./normalize";

export interface ParseReceiptOptions {
  today?: Date;
  defaultCurrency?: string;
  categories?: Array<{ id: string; name: string }>;
  /** Tesseract's mean word confidence, 0..100. */
  ocrConfidence?: number;
}

/* ------------------------------------------------------------------ */
/* Money                                                                */
/* ------------------------------------------------------------------ */

const CURRENCY_MARKERS: Array<[RegExp, string]> = [
  [/€|\bEUR\b/i, "EUR"],
  [/£|\bGBP\b/i, "GBP"],
  [/\bRWF\b|\bFRW\b|\bFrw\b/i, "RWF"],
  [/\bBIF\b|\bFBu\b/i, "BIF"],
  [/\bKES\b|\bKSh\b/i, "KES"],
  [/\bUGX\b|\bUSh\b/i, "UGX"],
  [/\bTZS\b|\bTSh\b/i, "TZS"],
  [/₹|\bINR\b|\bRs\.?\s?\d/i, "INR"],
  [/₦|\bNGN\b/i, "NGN"],
  [/\bCAD\b|\bC\$/i, "CAD"],
  [/\bAUD\b|\bA\$/i, "AUD"],
  [/\bUSD\b|\bUS\$/i, "USD"],
];

// 84.20 · 1,234.56 · 23,45 · 12.500 · 12,500 (thousands only) · 5
const MONEY_TOKEN = /(?<![\d/:.-])(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d+[.,]\d{2}|\d{1,6})(?![\d/:])/g;

/** Parse a money token, inferring decimal separator from the digit grouping. */
export function parseMoneyToken(token: string): number | null {
  const t = token.trim();
  if (!t) return null;
  const parts = t.split(/[.,]/);
  if (parts.length === 1) return Number.isFinite(Number(t)) ? Number(t) : null;
  const last = parts[parts.length - 1];
  if (last.length === 2) {
    // decimal part
    const intPart = parts.slice(0, -1).join("");
    const n = Number(`${intPart}.${last}`);
    return Number.isFinite(n) ? n : null;
  }
  if (last.length === 3 && parts.slice(1).every((p) => p.length === 3)) {
    // thousands grouping only
    const n = Number(parts.join(""));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

interface MoneyHit {
  value: number;
  index: number;
  raw: string;
  hasDecimals: boolean;
  currencyAdjacent: boolean;
}

function moneyInLine(line: string): MoneyHit[] {
  const hits: MoneyHit[] = [];
  for (const m of line.matchAll(MONEY_TOKEN)) {
    const raw = m[1];
    const idx = m.index ?? 0;
    const before = line.slice(Math.max(0, idx - 6), idx);
    const after = line.slice(idx + raw.length, idx + raw.length + 3);
    if (/#\s*$/.test(before) || /^\s*%/.test(after)) continue; // "#1234", "15%"
    if (/^\d{4}$/.test(raw) && !/[$€£]\s*$/.test(before)) continue; // bare years / store codes
    const hasDecimals = /[.,]\d{2}$/.test(raw);
    const currencyAdjacent = /[$€£₹₦]\s*$|\b(?:USD|EUR|GBP|RWF|FRW|BIF|KES|KSH|UGX|TZS|INR|NGN|CAD|AUD)\s*$/i.test(before) || /^\s*(?:USD|EUR|GBP|RWF|FRW|BIF|KES|KSH|UGX|TZS|INR|NGN|CAD|AUD)\b/i.test(after);
    // Plain integers only count as money when a currency marker sits next to them (zero-decimal currencies).
    if (!hasDecimals && !/[.,]\d{3}/.test(raw) && !currencyAdjacent) continue;
    const value = parseMoneyToken(raw);
    if (value === null || value <= 0 || value > 10_000_000) continue;
    hits.push({ value, index: idx, raw, hasDecimals, currencyAdjacent });
  }
  return hits;
}

/* ------------------------------------------------------------------ */
/* Line classification                                                  */
/* ------------------------------------------------------------------ */

const TOTAL_STRONG = /\b(grand\s*total|total\s*(?:due|paid|amount|sale|purchase|charged)|amount\s*(?:due|paid|tendered|charged)|balance\s*due|to\s*pay|payment\s*amount|montant\s*total|total\s*ttc|gesamtbetrag|betrag)\b/i;
const TOTAL_WEAK = /\b(total|totale?|gesamt|summe|amount)\b/i;
const NOT_TOTAL = /\b(sub\s*-?\s*total|subtotal|tax|vat|tva|mwst|tip|gratuity|change|cash\s*back|savings?|saved|discount|coupon|points|reward|before|items?|qty|quantity|balance\s*(?:remaining|left|forward)|you\s*(?:saved|pay\s*only))\b/i;
const PAYMENT_LINE = /\b(visa|mastercard|master\s*card|amex|american\s*express|discover|debit|credit|cash|apple\s*pay|google\s*pay|mobile\s*money|momo|mtn|airtel|card|approved|auth(?:orization)?|tendered|change)\b/i;
const NOISE_LINE = /\b(receipt|invoice|welcome|thank|thanks|visit|again|order\s*#?|table|server|cashier|clerk|register|reg\b|terminal|tel|phone|fax|www\.|http|\.com|\.net|\.org|@|street|st\.|ave\b|avenue|blvd|road|rd\.|suite|ste\b|unit\b|floor|p\.?o\.?\s*box|customer\s*copy|merchant\s*copy|duplicate|survey|return\s*policy)\b/i;
const MONTHS = "jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec";

/* ------------------------------------------------------------------ */
/* Dates                                                                */
/* ------------------------------------------------------------------ */

function monthIndex(name: string): number {
  const key = name.slice(0, 3).toLowerCase();
  return ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(key);
}

function makeDate(y: number, m: number, d: number, today: Date): string | null {
  if (y < 100) y += 2000;
  if (y < 2000 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (dt > tomorrow) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function findDates(text: string, today: Date, preferMonthFirst: boolean): string[] {
  const found: string[] = [];
  const push = (v: string | null) => {
    if (v && !found.includes(v)) found.push(v);
  };

  for (const m of text.matchAll(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/g)) push(makeDate(+m[1], +m[2], +m[3], today));

  for (const m of text.matchAll(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})\b/g)) {
    const a = +m[1];
    const b = +m[2];
    const y = +m[3];
    if (a > 12 && b <= 12) push(makeDate(y, b, a, today));
    else if (b > 12 && a <= 12) push(makeDate(y, a, b, today));
    else if (preferMonthFirst) push(makeDate(y, a, b, today) ?? makeDate(y, b, a, today));
    else push(makeDate(y, b, a, today) ?? makeDate(y, a, b, today));
  }

  const monRx = new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTHS})[a-z]*\\.?,?\\s+(\\d{2}|\\d{4})\\b`, "gi");
  for (const m of text.matchAll(monRx)) push(makeDate(+m[3], monthIndex(m[2]) + 1, +m[1], today));

  const monFirstRx = new RegExp(`\\b(${MONTHS})[a-z]*\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{2}|\\d{4})\\b`, "gi");
  for (const m of text.matchAll(monFirstRx)) push(makeDate(+m[3], monthIndex(m[1]) + 1, +m[2], today));

  return found;
}

/* ------------------------------------------------------------------ */
/* Categories                                                           */
/* ------------------------------------------------------------------ */

interface Bucket {
  label: string;
  names: string[];
  keywords: string[];
}

const BUCKETS: Bucket[] = [
  { label: "Groceries", names: ["grocer", "supermarket", "market", "food"], keywords: ["grocery", "groceries", "market", "foods", "supermarket", "mart", "trader joe", "whole foods", "aldi", "kroger", "safeway", "costco", "walmart", "wegmans", "stop & shop", "stop shop", "shaw", "publix", "lidl", "produce", "deli", "farmers", "simba", "sawa citi", "supermarché", "supermarkt", "épicerie"] },
  { label: "Dining", names: ["dining", "restaurant", "eating", "food & drink", "food and drink", "coffee", "cafe", "takeout"], keywords: ["restaurant", "cafe", "café", "coffee", "espresso", "latte", "pizza", "burger", "grill", "bar", "bistro", "kitchen", "diner", "bakery", "starbucks", "dunkin", "mcdonald", "chipotle", "subway", "taco", "sushi", "server", "table", "guests", "gratuity", "tip", "dine", "brunch", "lunch", "dinner", "bäckerei", "backerei", "kaffee", "boulangerie", "brasserie", "patisserie", "pâtisserie"] },
  { label: "Transport", names: ["transport", "transit", "gas", "fuel", "car", "commute", "auto"], keywords: ["uber", "lyft", "taxi", "cab", "gas", "fuel", "gallon", "diesel", "petrol", "shell", "exxon", "chevron", "mobil", "sunoco", "parking", "garage", "transit", "metro", "bus", "ripta", "mbta", "amtrak", "train", "toll", "moto", "yego"] },
  { label: "Utilities", names: ["utilit", "bills", "internet", "phone"], keywords: ["electric", "electricity", "power", "water", "sewer", "internet", "wireless", "verizon", "at&t", "t-mobile", "comcast", "xfinity", "national grid", "utility", "kwh", "airtime", "data bundle"] },
  { label: "Entertainment", names: ["entertain", "fun", "leisure", "streaming", "subscriptions"], keywords: ["cinema", "theatre", "theater", "amc", "regal", "netflix", "spotify", "hulu", "disney", "steam", "playstation", "xbox", "tickets", "ticket", "concert", "museum", "bowling", "arcade", "canal+"] },
  { label: "Shopping", names: ["shop", "retail", "cloth", "apparel", "general"], keywords: ["amazon", "target", "best buy", "apple store", "uniqlo", "zara", "h&m", "gap", "old navy", "ikea", "mall", "nike", "adidas", "sephora", "macy", "marshalls", "tj maxx", "boutique"] },
  { label: "Health", names: ["health", "medical", "pharma", "wellness", "fitness"], keywords: ["pharmacy", "cvs", "walgreens", "rite aid", "clinic", "hospital", "dental", "dentist", "doctor", "medical", "rx", "prescription", "urgent care", "optical", "vision center", "gym", "fitness"] },
  { label: "Rent", names: ["rent", "housing", "home", "mortgage"], keywords: ["rent", "lease", "landlord", "apartment", "property management", "tenant"] },
  { label: "Travel", names: ["travel", "trip", "vacation", "flights", "hotel"], keywords: ["hotel", "motel", "airbnb", "inn", "resort", "airline", "airways", "flight", "delta", "united", "jetblue", "southwest", "rwandair", "booking", "hostel"] },
  { label: "Education", names: ["educat", "school", "books", "tuition"], keywords: ["tuition", "bookstore", "university", "college", "campus", "course", "textbook"] },
  { label: "Personal care", names: ["personal", "beauty", "self", "grooming"], keywords: ["salon", "barber", "spa", "nails", "haircut", "cosmetic"] },
];

function bucketsForCategoryName(name: string): Bucket[] {
  const n = name.toLowerCase();
  return BUCKETS.filter((b) => b.names.some((k) => n.includes(k)) || n.includes(b.label.toLowerCase()));
}

function keywordScore(keywords: string[], haystack: string): number {
  let score = 0;
  for (const k of keywords) {
    const rx = new RegExp(`(^|[^a-z])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`, "i");
    if (rx.test(haystack)) score += 1;
  }
  return score;
}

export function guessCategory(merchant: string | null, text: string, categories?: Array<{ id: string; name: string }>): { name: string | null; id: string | null } {
  const body = text.toLowerCase();
  const head = (merchant ?? "").toLowerCase();
  const scoreBucket = (b: Bucket) => keywordScore(b.keywords, head) * 3 + keywordScore(b.keywords, body);

  if (categories && categories.length > 0) {
    let best: { id: string; name: string; score: number } | null = null;
    for (const c of categories) {
      const buckets = bucketsForCategoryName(c.name);
      const score = buckets.reduce((s, b) => s + scoreBucket(b), 0);
      if (score > 0 && (!best || score > best.score)) best = { id: c.id, name: c.name, score };
    }
    return best ? { name: best.name, id: best.id } : { name: null, id: null };
  }

  let bestBucket: { label: string; score: number } | null = null;
  for (const b of BUCKETS) {
    const score = scoreBucket(b);
    if (score > 0 && (!bestBucket || score > bestBucket.score)) bestBucket = { label: b.label, score };
  }
  return { name: bestBucket?.label ?? null, id: null };
}

/* ------------------------------------------------------------------ */
/* Merchant                                                             */
/* ------------------------------------------------------------------ */

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length <= 2 && /^(of|to|at|by|&|de|la|le)$/i.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export function guessMerchant(lines: string[], today: Date): string | null {
  const top = lines.slice(0, 8);
  for (const raw of top) {
    const line = raw.replace(/[|_~*]+/g, " ").replace(/\s{2,}/g, " ").trim();
    const letters = (line.match(/[a-z]/gi) ?? []).length;
    if (letters < 3) continue;
    if (letters / Math.max(1, line.length) < 0.5) continue;
    if (NOISE_LINE.test(line)) continue;
    if (moneyInLine(line).length > 0) continue;
    if (findDates(line, today, true).length > 0) continue;
    if (/\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/.test(line)) continue;
    if (/\b[a-z]{2}\s+\d{5}\b/i.test(line)) continue;
    let name = line.replace(/\s*#\s*\d+.*$/, "").replace(/\bstore\s*\d+.*$/i, "").replace(/\s*[-–]\s*\d+\s*$/, "").trim();
    if (!name) continue;
    if (name === name.toUpperCase() || name === name.toLowerCase()) name = titleCase(name);
    return name.slice(0, 80);
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Main                                                                 */
/* ------------------------------------------------------------------ */

export function parseReceiptText(text: string, options: ParseReceiptOptions = {}): ReceiptExtractionRaw {
  const today = options.today ?? new Date();
  const defaultCurrency = (options.defaultCurrency ?? "USD").toUpperCase();
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter((l) => l.length > 0);
  const joined = lines.join("\n");

  const allMoney = lines.flatMap((l) => moneyInLine(l));
  const isReceipt = lines.length >= 4 && allMoney.length > 0;

  // --- currency
  let currency: string | null = null;
  for (const [rx, code] of CURRENCY_MARKERS) {
    if (rx.test(joined)) {
      currency = code;
      break;
    }
  }
  const explicitCurrency = currency !== null || /\$/.test(joined);
  if (!currency && /\$/.test(joined)) currency = defaultCurrency === "CAD" || defaultCurrency === "AUD" ? defaultCurrency : "USD";
  if (!currency) currency = defaultCurrency;
  const zeroDecimal = ["RWF", "BIF", "UGX", "KES", "TZS", "JPY", "KRW"].includes(currency);

  // --- total
  interface TotalHit {
    value: number;
    score: number;
    lineIndex: number;
  }
  let totalHit: TotalHit | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (NOT_TOTAL.test(line)) continue;
    let score = 0;
    if (TOTAL_STRONG.test(line)) score = 3;
    else if (TOTAL_WEAK.test(line)) score = /\btotal/i.test(line) ? 2 : 1;
    if (score === 0) continue;
    const money = moneyInLine(line).filter((m) => m.hasDecimals || zeroDecimal || m.currencyAdjacent);
    if (money.length === 0) continue;
    const value = money[money.length - 1].value;
    if (!totalHit || score > totalHit.score || (score === totalHit.score && i >= totalHit.lineIndex)) totalHit = { value, score, lineIndex: i };
  }

  let amount: number | null = totalHit ? totalHit.value : null;
  let amountFromFallback = false;
  if (amount === null && allMoney.length > 0) {
    // Fallback: the largest plausible amount on a line that is not a phone/date/id.
    const candidates = allMoney.filter((m) => m.hasDecimals || zeroDecimal || m.currencyAdjacent);
    if (candidates.length > 0) {
      amount = Math.max(...candidates.map((m) => m.value));
      amountFromFallback = true;
    }
  }

  // --- date (prefer lines mentioning "date")
  const dateLines = lines.filter((l) => /\bdate\b/i.test(l)).join("\n");
  const preferMonthFirst = ["USD", "CAD"].includes(defaultCurrency) || currency === "USD";
  const dates = [...findDates(dateLines, today, preferMonthFirst), ...findDates(joined, today, preferMonthFirst)];
  const transactionDate = dates[0] ?? null;

  // --- merchant & category
  const merchant = guessMerchant(lines, today);
  const category = guessCategory(merchant, joined, options.categories);

  // --- payment method
  let paymentMethod: string | null = null;
  const payLine = lines.find((l) => PAYMENT_LINE.test(l) && !/\bcash\s*back\b/i.test(l));
  if (payLine) {
    const brand = payLine.match(/\b(visa|mastercard|master\s*card|amex|american\s*express|discover|debit|credit|cash|apple\s*pay|google\s*pay|mobile\s*money|momo|mtn|airtel)\b/i)?.[1];
    const last4 = joined.match(/(?:\*{2,}|x{2,}|•{2,}|ending(?:\s+in)?)\s*(\d{4})\b/i)?.[1];
    if (brand) paymentMethod = `${titleCase(brand)}${last4 ? ` •••• ${last4}` : ""}`;
  }

  // --- items: name + trailing price, between the header and the total line
  const stopIndex = totalHit ? totalHit.lineIndex : lines.length;
  const items: Array<{ name: string; amount: number | null }> = [];
  for (let i = 0; i < stopIndex && items.length < 20; i++) {
    const line = lines[i];
    if (NOT_TOTAL.test(line) || TOTAL_WEAK.test(line) || PAYMENT_LINE.test(line) || NOISE_LINE.test(line)) continue;
    const money = moneyInLine(line);
    if (money.length === 0) continue;
    const last = money[money.length - 1];
    if (!last.hasDecimals && !zeroDecimal) continue;
    if (last.index < line.length * 0.35) continue; // price should sit at the right
    let name = line
      .slice(0, last.index)
      .replace(/[$€£₹₦]|\b(?:USD|EUR|GBP|RWF|KES)\b/gi, "")
      .replace(/^\s*\d+\s*(?:x|@|\*)\s*/i, "")
      .replace(/\s+\d+(?:[.,]\d{2})?\s*(?:x|@)\s*$/i, "")
      .replace(/[.\-_:]+\s*$/, "")
      .trim();
    if ((name.match(/[a-z]/gi) ?? []).length < 3) continue;
    if (findDates(name, today, preferMonthFirst).length > 0) continue;
    if (name === name.toUpperCase()) name = titleCase(name);
    items.push({ name: name.slice(0, 80), amount: last.value });
  }

  // --- confidence & uncertainty
  const ocr = options.ocrConfidence === undefined ? 0.7 : Math.max(0, Math.min(1, options.ocrConfidence / 100));
  const fieldScore =
    (amount === null ? 0 : amountFromFallback ? 0.5 : 1) * 0.4 +
    (transactionDate ? 1 : 0) * 0.2 +
    (merchant ? 1 : 0) * 0.25 +
    (explicitCurrency ? 1 : 0.6) * 0.15;
  const confidence = Math.round((0.45 * ocr + 0.55 * fieldScore) * 100) / 100;

  const uncertain: string[] = [];
  if (amount === null || amountFromFallback) uncertain.push("amount");
  if (!transactionDate) uncertain.push("transaction_date");
  if (!merchant) uncertain.push("merchant_name");
  if (!explicitCurrency) uncertain.push("currency");
  if (!category.id && !category.name) uncertain.push("category");
  if (ocr < 0.6) for (const f of ["amount", "merchant_name"]) if (!uncertain.includes(f)) uncertain.push(f);

  return {
    is_receipt: isReceipt,
    merchant_name: merchant,
    amount,
    currency,
    transaction_date: transactionDate,
    category: category.name,
    category_id: category.id,
    payment_method: paymentMethod,
    items,
    confidence,
    uncertain_fields: uncertain,
    notes: null,
  };
}
