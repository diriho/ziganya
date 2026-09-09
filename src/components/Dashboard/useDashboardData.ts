import { useMemo } from "react";
import { useBudgets, useCategories, useSubscriptions, useTransactionsSince, useUploads, useUser } from "@sdk/requests";
import type { Transaction } from "@sdk/db";
import { addDays, startOfDay, toDateKey } from "@/lib/dates";

/** How far back the dashboard loads transactions. Covers 3 months + the previous 3 for comparisons. */
export const DASHBOARD_WINDOW_DAYS = 186;

/** Fixed for the session so every dashboard widget shares one cached query. */
export const DASHBOARD_FROM_KEY = toDateKey(addDays(startOfDay(new Date()), -DASHBOARD_WINDOW_DAYS));

export function useDashboardTransactions(userId: string) {
  return useTransactionsSince(userId, DASHBOARD_FROM_KEY);
}

/** The most common currency among the user's transactions (defaults to USD). */
export function dominantCurrency(transactions: Pick<Transaction, "currency">[]): string {
  const counts = new Map<string, number>();
  for (const t of transactions) {
    const c = (t.currency || "USD").toUpperCase();
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  let best = "USD";
  let bestCount = -1;
  for (const [c, n] of counts) {
    if (n > bestCount) {
      best = c;
      bestCount = n;
    }
  }
  return best;
}

export function useDashboardData(userId: string) {
  const userRow = useUser(userId);
  const transactions = useDashboardTransactions(userId);
  const categories = useCategories(userId);
  const subscriptions = useSubscriptions(userId, 500);
  const budgets = useBudgets(userId);
  const uploads = useUploads(userId, 6);

  const queries = [userRow, transactions, categories, subscriptions, budgets, uploads];
  const isLoading = queries.some((q) => q.isLoading);
  const failed = queries.find((q) => q.isError);

  const txs = useMemo(() => transactions.data ?? [], [transactions.data]);
  const currency = useMemo(() => dominantCurrency(txs), [txs]);

  return {
    userRow: userRow.data ?? null,
    transactions: txs,
    categories: categories.data ?? [],
    subscriptions: subscriptions.data ?? [],
    budgets: budgets.data ?? [],
    uploads: uploads.data ?? [],
    currency,
    isLoading,
    isError: !!failed,
    error: failed?.error ?? null,
    refetch: () => queries.forEach((q) => void q.refetch()),
  };
}
