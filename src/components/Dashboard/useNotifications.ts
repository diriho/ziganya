import { useCallback, useMemo } from "react";
import { useBudgets, useSubscriptions, useUploads } from "@sdk/requests";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { budgetStatus, filterByRange, isExpense, pickOverallBudget, totalsOf, upcomingRenewals } from "@/lib/analytics";
import { startOfDay, startOfMonth } from "@/lib/dates";
import { formatCurrency, formatRelativeDay } from "@/lib/format";
import { useDashboardTransactions } from "./useDashboardData";

export type NotificationKind = "renewal" | "budget" | "upload";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  href: string;
  tone: "neutral" | "warn" | "danger" | "info";
}

export function useNotifications(userId: string) {
  const { data: subscriptions = [] } = useSubscriptions(userId, 500);
  const { data: budgets = [] } = useBudgets(userId);
  const { data: uploads = [] } = useUploads(userId, 6);
  const { data: transactions = [] } = useDashboardTransactions(userId);
  const [readIds, setReadIds] = useLocalStorage<string[]>("ziganya:notifications-read", []);

  const items = useMemo<AppNotification[]>(() => {
    const out: AppNotification[] = [];
    const today = startOfDay(new Date());

    for (const r of upcomingRenewals(subscriptions, 7, today)) {
      out.push({
        id: `renewal:${r.sub.id}:${r.dateKey}`,
        kind: "renewal",
        title: `${r.sub.name} renews ${formatRelativeDay(r.dateKey, today).toLowerCase()}`,
        description: `${formatCurrency(r.sub.amount, r.sub.currency || "USD")} · ${r.sub.billing_cycle ?? "monthly"}`,
        href: "/dashboard/subscriptions",
        tone: r.daysUntil <= 1 ? "warn" : "neutral",
      });
    }

    const overall = pickOverallBudget(budgets);
    if (overall && overall.alert_enabled !== false) {
      const spent = totalsOf(filterByRange(transactions, startOfMonth(today), today).filter(isExpense)).expense;
      const status = budgetStatus(overall, spent);
      if (status.state !== "good") {
        const monthKey = today.toISOString().slice(0, 7);
        out.push({
          id: `budget:${overall.id}:${monthKey}:${status.state}`,
          kind: "budget",
          title: status.state === "over" ? "You're over your monthly budget" : "Approaching your monthly budget",
          description: `${formatCurrency(status.spent)} of ${formatCurrency(status.limit)} spent (${Math.round(status.ratio * 100)}%)`,
          href: "/dashboard",
          tone: status.state === "over" ? "danger" : "warn",
        });
      }
    }

    const pending = uploads.filter((u) => (u.status ?? "").toLowerCase() === "pending");
    if (pending.length > 0) {
      out.push({
        id: `uploads:${pending.map((p) => p.id).join(",")}`,
        kind: "upload",
        title: `${pending.length} receipt${pending.length === 1 ? "" : "s"} waiting to be processed`,
        description: pending[0].file_name ?? "Receipt upload",
        href: "/dashboard",
        tone: "info",
      });
    }

    return out;
  }, [subscriptions, budgets, uploads, transactions]);

  const unread = useMemo(() => items.filter((i) => !readIds.includes(i.id)), [items, readIds]);

  const markAllRead = useCallback(() => {
    setReadIds((prev) => Array.from(new Set([...prev, ...items.map((i) => i.id)])).slice(-200));
  }, [items, setReadIds]);

  const markRead = useCallback(
    (id: string) => setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id].slice(-200))),
    [setReadIds]
  );

  return { items, unreadCount: unread.length, markAllRead, markRead, isRead: (id: string) => readIds.includes(id) };
}
