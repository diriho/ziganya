import type { Subscription, Transaction } from "@sdk/db";
import { isExpense } from "@/lib/analytics";
import { dateKeyOf } from "@/lib/dates";
import { titleCase } from "@/lib/format";
import type { CalendarActivity } from "./types";

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function buildActivities(subscriptions: Subscription[], transactions: Transaction[]): CalendarActivity[] {
  const subs: CalendarActivity[] = subscriptions.flatMap((sub) => {
    const key = dateKeyOf(sub.next_billing_date);
    if (!key) return [];
    return [
      {
        id: `sub-${sub.id}`,
        dateKey: key,
        type: "subscription" as const,
        title: sub.name,
        subtitle: `${titleCase(sub.billing_cycle) || "Monthly"} renewal`,
        amount: Math.abs(Number(sub.amount) || 0),
        currency: sub.currency || "USD",
        status: sub.status || "active",
        outflow: true,
      },
    ];
  });

  const txs: CalendarActivity[] = transactions.flatMap((tx) => {
    const key = dateKeyOf(tx.transaction_date);
    if (!key) return [];
    const expense = isExpense(tx);
    return [
      {
        id: `tx-${tx.id}`,
        dateKey: key,
        type: "transaction" as const,
        title: tx.merchant_name || tx.description || (expense ? "Expense" : "Income"),
        subtitle: titleCase(tx.source) || "Manual",
        amount: Math.abs(Number(tx.amount) || 0),
        currency: tx.currency || "USD",
        status: expense ? "expense" : "income",
        outflow: expense,
      },
    ];
  });

  return [...subs, ...txs].sort((a, b) => a.dateKey.localeCompare(b.dateKey) || a.title.localeCompare(b.title));
}

export function groupActivitiesByDate(activities: CalendarActivity[]): [string, CalendarActivity[]][] {
  const groups = new Map<string, CalendarActivity[]>();
  for (const item of activities) {
    if (!groups.has(item.dateKey)) groups.set(item.dateKey, []);
    groups.get(item.dateKey)!.push(item);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export interface DaySummary {
  count: number;
  outflow: number;
  inflow: number;
}

export function summarizeByDate(activities: CalendarActivity[]): Map<string, DaySummary> {
  const map = new Map<string, DaySummary>();
  for (const a of activities) {
    const s = map.get(a.dateKey) ?? { count: 0, outflow: 0, inflow: 0 };
    s.count += 1;
    if (a.outflow) s.outflow += a.amount;
    else s.inflow += a.amount;
    map.set(a.dateKey, s);
  }
  return map;
}
