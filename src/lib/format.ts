/**
 * Shared formatting utilities. Single source of truth for display formatting.
 */
import { parseDateKey, dateKeyOf } from "./dates";

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: string, compact: boolean, digits?: number) {
  const key = `${currency}|${compact}|${digits ?? ""}`;
  let fmt = currencyFormatters.get(key);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        notation: compact ? "compact" : "standard",
        maximumFractionDigits: digits ?? (compact ? 1 : 2),
        minimumFractionDigits: compact ? 0 : digits ?? 2,
      });
    } catch {
      fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
    }
    currencyFormatters.set(key, fmt);
  }
  return fmt;
}

export interface CurrencyOptions {
  /** Abbreviate large values: $4.2K, $1.3M */
  compact?: boolean;
  /** Prefix positive numbers with "+" */
  signed?: boolean;
  /** Force a number of fraction digits */
  digits?: number;
}

export function formatCurrency(
  amount: number,
  currency: string = "USD",
  options: CurrencyOptions = {}
): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const text = currencyFormatter(currency || "USD", !!options.compact, options.digits).format(
    Math.abs(safe)
  );
  if (safe < 0) return `-${text}`;
  if (options.signed && safe > 0) return `+${text}`;
  return text;
}

/** Signed amount for a transaction row: expenses negative, income positive. */
export function formatSignedAmount(amount: number, isExpense: boolean, currency = "USD") {
  const magnitude = Math.abs(amount);
  return formatCurrency(isExpense ? -magnitude : magnitude, currency, { signed: true });
}

export function formatPercent(value: number, digits = 0): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

const defaultDateOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

/** Format a date string (date-only or timestamp) without timezone drift. */
export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = defaultDateOptions
): string {
  if (!date) return "—";
  const d = date instanceof Date ? date : toLocalDate(date);
  if (!d || Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", options);
}

export function formatShortDate(date: string | Date | null | undefined): string {
  return formatDate(date, { month: "short", day: "numeric" });
}

export function formatLongDate(date: string | Date | null | undefined): string {
  return formatDate(date, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Turn a date-only string into a local Date; timestamps parse normally. */
export function toLocalDate(value: string): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return parseDateKey(value);
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Today", "Yesterday", "3 days ago", "In 5 days", or a short date. */
export function formatRelativeDay(value: string | null | undefined, today: Date = new Date()): string {
  const key = dateKeyOf(value);
  if (!key) return "—";
  const target = parseDateKey(key);
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((target.getTime() - base.getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1 && diff <= 14) return `In ${diff} days`;
  if (diff < -1 && diff >= -14) return `${Math.abs(diff)} days ago`;
  return formatShortDate(key);
}

/** Relative time for timestamps: "just now", "4m ago", "3h ago", then falls back to a date. */
export function formatTimeAgo(value: string | null | undefined, now: Date = new Date()): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const sec = Math.round((now.getTime() - d.getTime()) / 1000);
  if (sec < 45) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d ago`;
  return formatShortDate(d);
}

export function formatSubscriptionAmount(amount: number, currency: string): string {
  return formatCurrency(amount, currency || "USD");
}

export function formatAmount(amount: number, currency: string): string {
  return formatCurrency(amount, currency || "USD");
}

export function initialsOf(name: string | null | undefined, fallback = "U"): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase() || fallback;
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
