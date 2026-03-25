import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSubscriptions, useTransactions } from "@sdk/requests";
import { PageError, PageLoading } from "@/components/PageState";
import { ActivityFeed } from "./ActivityFeed";
import type { CalendarActivity, CalendarView as CalendarViewMode } from "./types";
import {
  WEEK_DAYS,
  addDays,
  endOfMonth,
  endOfWeek,
  groupActivitiesByDate,
  sameMonth,
  startOfMonth,
  startOfWeek,
  toDateKey,
} from "./utils";

interface CalendarViewProps {
  userId: string;
}

export const CalendarView = ({ userId }: CalendarViewProps) => {
  const [view, setView] = useState<CalendarViewMode>("week");
  const [focusedDate, setFocusedDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const todayKey = toDateKey(new Date());

  const {
    data: subscriptions = [],
    isLoading: subscriptionsLoading,
    error: subscriptionsError,
  } = useSubscriptions(userId, 500);
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useTransactions(userId, 500);

  const activities = useMemo<CalendarActivity[]>(() => {
    const subscriptionActivities: CalendarActivity[] = subscriptions
      .filter((sub) => Boolean(sub.next_billing_date))
      .map((sub) => ({
        id: `sub-${sub.id}`,
        dateKey: String(sub.next_billing_date).slice(0, 10),
        type: "subscription",
        title: sub.name,
        subtitle: `${sub.billing_cycle} billing`,
        amount: sub.amount,
        currency: sub.currency || "USD",
        status: sub.status || "active",
      }));

    const transactionActivities: CalendarActivity[] = transactions.map((tx) => ({
      id: `tx-${tx.id}`,
      dateKey: tx.transaction_date.slice(0, 10),
      type: "transaction",
      title: tx.merchant_name || tx.description || "Transaction",
      subtitle: tx.source || "manual",
      amount: tx.amount,
      currency: tx.currency || "USD",
      status: tx.type || "expense",
    }));

    return [...subscriptionActivities, ...transactionActivities].sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
      return a.title.localeCompare(b.title);
    });
  }, [subscriptions, transactions]);

  const weekStart = useMemo(() => startOfWeek(focusedDate), [focusedDate]);
  const weekEnd = useMemo(() => endOfWeek(focusedDate), [focusedDate]);

  const rangeLabel = useMemo(() => {
    if (view === "day") {
      return focusedDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    if (view === "month") {
      return focusedDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    const startLabel = weekStart.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endLabel = weekEnd.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startLabel} - ${endLabel}`;
  }, [focusedDate, view, weekEnd, weekStart]);

  const weekDays = useMemo(() => {
    const base = startOfWeek(focusedDate);
    return Array.from({ length: 7 }, (_, index) => addDays(base, index));
  }, [focusedDate]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(focusedDate);
    const gridStart = startOfWeek(monthStart);
    const monthEnd = endOfMonth(focusedDate);
    const gridEnd = endOfWeek(monthEnd);

    const days: Date[] = [];
    for (let current = gridStart; current <= gridEnd; current = addDays(current, 1)) {
      days.push(current);
    }

    return days;
  }, [focusedDate]);

  const activityCountByDate = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const item of activities) {
      byDate.set(item.dateKey, (byDate.get(item.dateKey) ?? 0) + 1);
    }
    return byDate;
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (view === "day") {
      const dayKey = toDateKey(focusedDate);
      return activities.filter((item) => item.dateKey === dayKey);
    }

    if (view === "month") {
      const monthStartKey = toDateKey(startOfMonth(focusedDate));
      const monthEndKey = toDateKey(endOfMonth(focusedDate));
      return activities.filter(
        (item) => item.dateKey >= monthStartKey && item.dateKey <= monthEndKey
      );
    }

    const weekStartKey = toDateKey(weekStart);
    const weekEndKey = toDateKey(weekEnd);
    const inWeek = activities.filter(
      (item) => item.dateKey >= weekStartKey && item.dateKey <= weekEndKey
    );

    if (!selectedDateKey) return inWeek;
    return inWeek.filter((item) => item.dateKey === selectedDateKey);
  }, [activities, focusedDate, selectedDateKey, view, weekEnd, weekStart]);

  const groupedActivities = useMemo(
    () => groupActivitiesByDate(filteredActivities),
    [filteredActivities]
  );

  const onNavigate = (direction: "prev" | "next") => {
    const amount = direction === "prev" ? -1 : 1;
    setSelectedDateKey(null);
    setFocusedDate((current) => {
      if (view === "day") return addDays(current, amount);
      if (view === "week") return addDays(current, amount * 7);
      return new Date(current.getFullYear(), current.getMonth() + amount, 1);
    });
  };

  if (subscriptionsLoading || transactionsLoading) return <PageLoading />;
  if (subscriptionsError || transactionsError) {
    return <PageError message="Unable to load calendar activities." />;
  }

  return (
    <section className="space-y-6" aria-labelledby="calendar-title">
      <header className="overflow-hidden rounded-3xl bg-brand-green p-6 text-white shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/90">
              Planning
            </p>
            <h1 id="calendar-title" className="mt-2 text-3xl font-bold tracking-tight">
              Activity Calendar
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50/90">
              Track transactions and subscription renewals across day, week, and month views.
            </p>
          </div>

          <div className="inline-flex rounded-xl border border-white/20 bg-white/10 p-1 backdrop-blur">
            {(["day", "week", "month"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setView(option);
                  setSelectedDateKey(null);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  view === option
                    ? "bg-white text-[#0b4b28]"
                    : "text-white/90 hover:bg-white/10"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Selected Range
            </p>
            <h2 className="mt-1 text-xl font-bold text-zinc-900">{rangeLabel}</h2>
          </div>

          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate("prev")}
              className="rounded-xl border border-zinc-200 p-2.5 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
              aria-label="Previous range"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("next")}
              className="rounded-xl border border-zinc-200 p-2.5 text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
              aria-label="Next range"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {view === "week" && (
          <div className="mt-5 grid grid-cols-7 gap-2">
            {weekDays.map((date) => {
              const dateKey = toDateKey(date);
              const isToday = dateKey === todayKey;
              const isSelected = selectedDateKey === dateKey;
              const isMuted = !sameMonth(date, focusedDate);
              const count = activityCountByDate.get(dateKey) ?? 0;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() =>
                    setSelectedDateKey((prev) => (prev === dateKey ? null : dateKey))
                  }
                  className={`rounded-2xl border p-3 text-left transition ${
                    isSelected
                      ? "border-brand-green bg-emerald-50 shadow-sm"
                      : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-wide ${
                      isMuted ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {WEEK_DAYS[date.getDay()]}
                  </p>
                  <p
                    className={`mt-1 text-lg font-bold ${
                      isMuted ? "text-zinc-400" : "text-zinc-900"
                    }`}
                  >
                    {date.getDate()}
                  </p>
                  <p className="mt-2 text-xs font-medium text-zinc-500">
                    {count} {count === 1 ? "activity" : "activities"}
                  </p>
                  {isToday && (
                    <span className="mt-2 inline-flex rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      Today
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {view === "month" && (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((date) => {
                const dateKey = toDateKey(date);
                const isToday = dateKey === todayKey;
                const isSelected = selectedDateKey === dateKey;
                const isMuted = !sameMonth(date, focusedDate);
                const count = activityCountByDate.get(dateKey) ?? 0;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() =>
                      setSelectedDateKey((prev) => (prev === dateKey ? null : dateKey))
                    }
                    className={`min-h-24 rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? "border-brand-green bg-emerald-50 shadow-sm"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    } ${isMuted ? "opacity-55" : ""}`}
                  >
                    <p
                      className={`text-sm font-bold ${
                        isMuted ? "text-zinc-400" : "text-zinc-900"
                      }`}
                    >
                      {date.getDate()}
                    </p>

                    {count > 0 ? (
                      <p className="mt-2 text-xs font-medium text-zinc-500">
                        {count} {count === 1 ? "activity" : "activities"}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-zinc-400">No activity</p>
                    )}

                    {isToday && (
                      <span className="mt-2 inline-flex rounded-full bg-brand-green px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Today
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ActivityFeed groupedActivities={groupedActivities} total={filteredActivities.length} />
    </section>
  );
};
