/**
 * Date helpers that treat "YYYY-MM-DD" strings as *local* calendar dates.
 * `new Date("2026-09-08")` parses as UTC midnight and shifts a day in most
 * US timezones, so everything here goes through `parseDateKey` instead.
 */

export type DateKey = string; // "YYYY-MM-DD"

export const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(value: Date): DateKey {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Normalize any date-ish string (date or ISO timestamp) to a "YYYY-MM-DD" key. */
export function dateKeyOf(value: string | null | undefined): DateKey | null {
  if (!value) return null;
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    // Date-only or timestamp: for timestamps convert to local date first.
    if (s.length > 10) {
      const d = new Date(s);
      return Number.isNaN(d.getTime()) ? null : toDateKey(d);
    }
    return s.slice(0, 10);
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : toDateKey(d);
}

export function parseDateKey(key: DateKey): Date {
  const [y, m, d] = key.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, date.getDate());
}

export function startOfWeek(date: Date): Date {
  return startOfDay(addDays(date, -date.getDay()));
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

/** Inclusive list of day keys between two dates. */
export function eachDayKey(from: Date, to: Date): DateKey[] {
  const keys: DateKey[] = [];
  for (let d = startOfDay(from); d <= to; d = addDays(d, 1)) keys.push(toDateKey(d));
  return keys;
}

export type RangePreset = "7d" | "30d" | "3m";
export type BucketSize = "day" | "week" | "month";

/** The minimal window description the bucketing code needs. */
export interface BucketWindow {
  from: Date;
  to: Date;
  bucket: BucketSize;
  days: number;
}

export interface AnalyticsRange extends BucketWindow {
  preset: RangePreset;
  prevFrom: Date;
  prevTo: Date;
}

/** Pick a sensible window and bucket size for an arbitrary set of day keys. */
export function autoWindow(keys: DateKey[], today: Date = new Date()): BucketWindow | null {
  const valid = keys.filter(Boolean).sort();
  if (valid.length === 0) return null;
  const from = parseDateKey(valid[0]);
  const last = parseDateKey(valid[valid.length - 1]);
  const to = last > today ? last : startOfDay(today) > last ? last : startOfDay(today);
  const days = daysBetween(from, to) + 1;
  const bucket: BucketSize = days > 400 ? "month" : days > 62 ? "week" : "day";
  return { from: startOfDay(from), to: startOfDay(to), bucket, days };
}

/**
 * Resolve a preset to a concrete inclusive window ending today, plus the
 * equally-sized window immediately before it (for period-over-period deltas).
 */
export function resolveRange(preset: RangePreset, today: Date = new Date()): AnalyticsRange {
  const to = startOfDay(today);
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  const from = addDays(to, -(days - 1));
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(days - 1));
  return { preset, from, to, prevFrom, prevTo, bucket: preset === "3m" ? "week" : "day", days };
}

export function isWithin(key: DateKey, from: Date, to: Date): boolean {
  const f = toDateKey(from);
  const t = toDateKey(to);
  return key >= f && key <= t;
}
