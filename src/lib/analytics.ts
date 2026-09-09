/**
 * Pure aggregation logic for the dashboard. No React, no I/O — easy to test.
 */
import type { Budget, Category, Subscription, Transaction } from "@sdk/db";
import {
  addDays,
  addMonths,
  dateKeyOf,
  eachDayKey,
  endOfMonth,
  parseDateKey,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDateKey,
  type BucketWindow,
  type DateKey,
} from "./dates";

/* ------------------------------------------------------------------ */
/* Transactions                                                         */
/* ------------------------------------------------------------------ */

export function isIncome(tx: Pick<Transaction, "type">): boolean {
  return (tx.type ?? "").toLowerCase() === "income";
}

export function isExpense(tx: Pick<Transaction, "type">): boolean {
  return !isIncome(tx);
}

/** Amounts are stored as magnitudes; guard against negative rows anyway. */
export function amountOf(tx: Pick<Transaction, "amount">): number {
  const n = Number(tx.amount);
  return Number.isFinite(n) ? Math.abs(n) : 0;
}

export function txDateKey(tx: Pick<Transaction, "transaction_date">): DateKey | null {
  return dateKeyOf(tx.transaction_date);
}

export function filterByRange<T extends Pick<Transaction, "transaction_date">>(
  txs: T[],
  from: Date,
  to: Date
): T[] {
  const f = toDateKey(from);
  const t = toDateKey(to);
  return txs.filter((tx) => {
    const k = txDateKey(tx);
    return !!k && k >= f && k <= t;
  });
}

export interface Totals {
  income: number;
  expense: number;
  net: number;
  count: number;
}

export function totalsOf(txs: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const tx of txs) {
    const amt = amountOf(tx);
    if (isIncome(tx)) income += amt;
    else expense += amt;
  }
  return { income: round2(income), expense: round2(expense), net: round2(income - expense), count: txs.length };
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Percent change from previous to current; null when there is no baseline. */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/* ------------------------------------------------------------------ */
/* Time buckets for the spending chart                                  */
/* ------------------------------------------------------------------ */

export interface Bucket {
  /** Sort key: first day in the bucket (YYYY-MM-DD). */
  key: DateKey;
  /** Short axis label. */
  label: string;
  /** Long label for tooltips / table. */
  longLabel: string;
  expense: number;
  income: number;
  count: number;
}

/**
 * Bucket transactions into zero-filled day, week or month columns covering the
 * window. Weeks start on Sunday; edge buckets are clipped to the window.
 */
export function bucketTransactions(txs: Transaction[], range: BucketWindow): Bucket[] {
  const buckets = new Map<DateKey, Bucket>();

  const makeLabel = (start: Date, end: Date): { label: string; longLabel: string } => {
    if (range.bucket === "month") {
      return {
        label: start.toLocaleDateString("en-US", { month: "short" }),
        longLabel: start.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      };
    }
    if (range.bucket === "day") {
      const label =
        range.days <= 7
          ? start.toLocaleDateString("en-US", { weekday: "short" })
          : start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const longLabel = start.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      return { label, longLabel };
    }
    const s = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const e = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return { label: s, longLabel: `${s} – ${e}` };
  };

  if (range.bucket === "day") {
    for (const key of eachDayKey(range.from, range.to)) {
      const d = parseDateKey(key);
      const { label, longLabel } = makeLabel(d, d);
      buckets.set(key, { key, label, longLabel, expense: 0, income: 0, count: 0 });
    }
  } else if (range.bucket === "week") {
    let cursor = startOfWeek(range.from);
    while (cursor <= range.to) {
      const start = cursor < range.from ? range.from : cursor;
      const weekEnd = addDays(cursor, 6);
      const end = weekEnd > range.to ? range.to : weekEnd;
      const key = toDateKey(start);
      const { label, longLabel } = makeLabel(start, end);
      buckets.set(key, { key, label, longLabel, expense: 0, income: 0, count: 0 });
      cursor = addDays(cursor, 7);
    }
  } else {
    let cursor = startOfMonth(range.from);
    while (cursor <= range.to) {
      const start = cursor < range.from ? range.from : cursor;
      const monthEnd = endOfMonth(cursor);
      const end = monthEnd > range.to ? range.to : monthEnd;
      const key = toDateKey(start);
      const { label, longLabel } = makeLabel(start, end);
      buckets.set(key, { key, label, longLabel, expense: 0, income: 0, count: 0 });
      cursor = addMonths(startOfMonth(cursor), 1);
    }
  }

  const keys = Array.from(buckets.keys()).sort();
  const bucketKeyFor = (dayKey: DateKey): DateKey | null => {
    if (range.bucket === "day") return buckets.has(dayKey) ? dayKey : null;
    // Find the last bucket whose start <= dayKey
    let found: DateKey | null = null;
    for (const k of keys) {
      if (k <= dayKey) found = k;
      else break;
    }
    return found;
  };

  const fromKey = toDateKey(range.from);
  const toKey = toDateKey(range.to);
  for (const tx of txs) {
    const dayKey = txDateKey(tx);
    if (!dayKey || dayKey < fromKey || dayKey > toKey) continue;
    const bk = bucketKeyFor(dayKey);
    if (!bk) continue;
    const b = buckets.get(bk)!;
    const amt = amountOf(tx);
    if (isIncome(tx)) b.income += amt;
    else b.expense += amt;
    b.count += 1;
  }

  return keys.map((k) => {
    const b = buckets.get(k)!;
    return { ...b, expense: round2(b.expense), income: round2(b.income) };
  });
}

/* ------------------------------------------------------------------ */
/* Category breakdown                                                   */
/* ------------------------------------------------------------------ */

export interface CategorySlice {
  id: string | null;
  name: string;
  amount: number;
  share: number; // 0..1
  count: number;
  color: string | null;
}

export function categoryBreakdown(
  txs: Transaction[],
  categories: Pick<Category, "id" | "name" | "color">[],
  topN = 5
): CategorySlice[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const acc = new Map<string, CategorySlice>();
  let total = 0;

  for (const tx of txs) {
    if (!isExpense(tx)) continue;
    const amt = amountOf(tx);
    total += amt;
    const id = tx.category_id ?? "__uncategorized";
    const cat = tx.category_id ? byId.get(tx.category_id) : undefined;
    const name = cat?.name ?? (tx.category_id ? "Unknown category" : "Uncategorized");
    const slice = acc.get(id) ?? {
      id: tx.category_id ?? null,
      name,
      amount: 0,
      share: 0,
      count: 0,
      color: cat?.color ?? null,
    };
    slice.amount += amt;
    slice.count += 1;
    acc.set(id, slice);
  }

  if (total === 0) return [];

  const sorted = Array.from(acc.values()).sort((a, b) => b.amount - a.amount);
  const head = sorted.slice(0, topN);
  const tail = sorted.slice(topN);
  if (tail.length > 0) {
    head.push({
      id: "__other",
      name: `Other (${tail.length})`,
      amount: tail.reduce((s, c) => s + c.amount, 0),
      share: 0,
      count: tail.reduce((s, c) => s + c.count, 0),
      color: null,
    });
  }
  return head.map((s) => ({ ...s, amount: round2(s.amount), share: s.amount / total }));
}

/* ------------------------------------------------------------------ */
/* Month-over-month KPIs                                                */
/* ------------------------------------------------------------------ */

export interface MonthlyKpis {
  monthStart: Date;
  monthToDate: Totals;
  /** Previous month, clipped to the same day-of-month so the comparison is fair. */
  prevSamePoint: Totals;
  prevFullMonth: Totals;
  spendingChangePct: number | null;
  /** Daily spend for the last `sparkDays` days, oldest first. */
  spark: number[];
}

export function monthlyKpis(txs: Transaction[], today: Date = new Date(), sparkDays = 14): MonthlyKpis {
  const day = startOfDay(today);
  const monthStart = startOfMonth(day);
  const prevMonthStart = startOfMonth(addMonths(monthStart, -1));
  const prevMonthEnd = endOfMonth(prevMonthStart);
  const dom = day.getDate();
  const prevSamePointEnd = new Date(
    prevMonthStart.getFullYear(),
    prevMonthStart.getMonth(),
    Math.min(dom, prevMonthEnd.getDate())
  );

  const monthToDate = totalsOf(filterByRange(txs, monthStart, day));
  const prevSamePoint = totalsOf(filterByRange(txs, prevMonthStart, prevSamePointEnd));
  const prevFullMonth = totalsOf(filterByRange(txs, prevMonthStart, prevMonthEnd));

  const sparkFrom = addDays(day, -(sparkDays - 1));
  const perDay = new Map<DateKey, number>();
  for (const k of eachDayKey(sparkFrom, day)) perDay.set(k, 0);
  for (const tx of txs) {
    if (!isExpense(tx)) continue;
    const k = txDateKey(tx);
    if (k && perDay.has(k)) perDay.set(k, (perDay.get(k) ?? 0) + amountOf(tx));
  }

  return {
    monthStart,
    monthToDate,
    prevSamePoint,
    prevFullMonth,
    spendingChangePct: percentChange(monthToDate.expense, prevSamePoint.expense),
    spark: Array.from(perDay.values()).map(round2),
  };
}

/* ------------------------------------------------------------------ */
/* Subscriptions                                                        */
/* ------------------------------------------------------------------ */

export function isActiveSubscription(sub: Pick<Subscription, "status">): boolean {
  const s = (sub.status ?? "active").toLowerCase();
  return s === "active" || s === "trial" || s === "trialing" || s === "upcoming";
}

/** Normalize a subscription's cost to a monthly figure. */
export function monthlyCostOf(sub: Pick<Subscription, "amount" | "billing_cycle">): number {
  const amt = Math.abs(Number(sub.amount) || 0);
  const cycle = (sub.billing_cycle ?? "monthly").toLowerCase();
  switch (cycle) {
    case "weekly":
      return (amt * 52) / 12;
    case "biweekly":
    case "bi-weekly":
    case "fortnightly":
      return (amt * 26) / 12;
    case "quarterly":
      return amt / 3;
    case "semiannual":
    case "semi-annual":
    case "biannual":
      return amt / 6;
    case "yearly":
    case "annual":
    case "annually":
      return amt / 12;
    case "daily":
      return amt * 30;
    default:
      return amt;
  }
}

export function subscriptionSummary(subs: Subscription[]) {
  const active = subs.filter(isActiveSubscription);
  const monthly = active.reduce((s, sub) => s + monthlyCostOf(sub), 0);
  return {
    activeCount: active.length,
    totalCount: subs.length,
    monthlyCost: round2(monthly),
    yearlyCost: round2(monthly * 12),
  };
}

export interface Renewal {
  sub: Subscription;
  dateKey: DateKey;
  daysUntil: number;
}

/** Active subscriptions renewing within `withinDays` days (including today). */
export function upcomingRenewals(subs: Subscription[], withinDays = 7, today: Date = new Date()): Renewal[] {
  const base = startOfDay(today);
  const out: Renewal[] = [];
  for (const sub of subs) {
    if (!isActiveSubscription(sub)) continue;
    const key = dateKeyOf(sub.next_billing_date);
    if (!key) continue;
    const days = Math.round((parseDateKey(key).getTime() - base.getTime()) / 86_400_000);
    if (days >= 0 && days <= withinDays) out.push({ sub, dateKey: key, daysUntil: days });
  }
  return out.sort((a, b) => a.daysUntil - b.daysUntil || a.sub.name.localeCompare(b.sub.name));
}

/** Projected charges per month for the next `months` months (single series). */
export function projectedCharges(subs: Subscription[], months = 6, today: Date = new Date()) {
  const start = startOfMonth(today);
  const rows = Array.from({ length: months }, (_, i) => {
    const d = addMonths(start, i);
    return {
      key: toDateKey(d),
      label: d.toLocaleDateString("en-US", { month: "short" }),
      longLabel: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      amount: 0,
      count: 0,
    };
  });

  for (const sub of subs) {
    if (!isActiveSubscription(sub)) continue;
    const amt = Math.abs(Number(sub.amount) || 0);
    const cycle = (sub.billing_cycle ?? "monthly").toLowerCase();
    const nextKey = dateKeyOf(sub.next_billing_date);
    const anchor = nextKey ? parseDateKey(nextKey) : start;
    const stepMonths =
      cycle === "quarterly" ? 3 : cycle === "semiannual" || cycle === "semi-annual" || cycle === "biannual" ? 6 : /year|annual/.test(cycle) ? 12 : 1;
    const perMonthCount =
      cycle === "weekly" ? 52 / 12 : cycle === "biweekly" || cycle === "bi-weekly" || cycle === "fortnightly" ? 26 / 12 : cycle === "daily" ? 30 : 0;

    rows.forEach((row, i) => {
      const monthDate = addMonths(start, i);
      if (perMonthCount > 0) {
        // High-frequency cycles: approximate per-month charges.
        if (monthDate >= startOfMonth(anchor)) {
          row.amount += amt * perMonthCount;
          row.count += Math.round(perMonthCount);
        }
        return;
      }
      // Monthly / quarterly / yearly: charge on months that align with the anchor.
      const monthsFromAnchor =
        (monthDate.getFullYear() - anchor.getFullYear()) * 12 + (monthDate.getMonth() - anchor.getMonth());
      if (monthsFromAnchor >= 0 && monthsFromAnchor % stepMonths === 0) {
        row.amount += amt;
        row.count += 1;
      }
    });
  }

  return rows.map((r) => ({ ...r, amount: round2(r.amount) }));
}

/* ------------------------------------------------------------------ */
/* Budgets                                                              */
/* ------------------------------------------------------------------ */

export type BudgetState = "good" | "warn" | "over";

export interface BudgetStatus {
  budget: Budget | null;
  limit: number;
  spent: number;
  remaining: number;
  ratio: number; // spent / limit, 0 when no budget
  state: BudgetState;
  thresholdPct: number;
}

/** The overall monthly budget is the one without a category. */
export function pickOverallBudget(budgets: Budget[]): Budget | null {
  const monthly = budgets.filter((b) => (b.period ?? "monthly").toLowerCase() === "monthly");
  return monthly.find((b) => !b.category_id) ?? monthly[0] ?? null;
}

export function budgetStatus(budget: Budget | null, spent: number): BudgetStatus {
  const limit = Math.max(0, Number(budget?.amount ?? 0));
  const thresholdRaw = Number(budget?.alert_threshold ?? 80);
  // alert_threshold may be stored as 0.8 or 80; normalize to percent.
  const thresholdPct = thresholdRaw <= 1 ? thresholdRaw * 100 : thresholdRaw;
  const ratio = limit > 0 ? spent / limit : 0;
  const state: BudgetState = ratio >= 1 ? "over" : ratio * 100 >= thresholdPct ? "warn" : "good";
  return {
    budget,
    limit,
    spent: round2(spent),
    remaining: round2(Math.max(0, limit - spent)),
    ratio,
    state,
    thresholdPct,
  };
}

/* ------------------------------------------------------------------ */
/* Top merchant helper                                                  */
/* ------------------------------------------------------------------ */

export function topMerchant(txs: Transaction[]): { name: string; amount: number } | null {
  const acc = new Map<string, number>();
  for (const tx of txs) {
    if (!isExpense(tx)) continue;
    const name = (tx.merchant_name ?? "").trim();
    if (!name) continue;
    acc.set(name, (acc.get(name) ?? 0) + amountOf(tx));
  }
  let best: { name: string; amount: number } | null = null;
  for (const [name, amount] of acc) {
    if (!best || amount > best.amount) best = { name, amount: round2(amount) };
  }
  return best;
}
