import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSubscriptions, useTransactions } from "@sdk/requests";
import { Button, Card, PageHeader, Segmented, cn } from "@/components/ui";
import { PageError, PageLoading } from "@/components/PageState";
import { addDays, endOfMonth, endOfWeek, sameMonth, startOfMonth, startOfWeek, toDateKey } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";
import { ActivityFeed } from "./ActivityFeed";
import type { CalendarViewMode } from "./types";
import { WEEK_DAYS, buildActivities, groupActivitiesByDate, summarizeByDate } from "./utils";

export function CalendarView({ userId }: { userId: string }) {
  const [view, setView] = useState<CalendarViewMode>("week");
  const [focusedDate, setFocusedDate] = useState(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const todayKey = toDateKey(new Date());

  const subs = useSubscriptions(userId, 500);
  const txs = useTransactions(userId, 5000);

  const activities = useMemo(() => buildActivities(subs.data ?? [], txs.data ?? []), [subs.data, txs.data]);
  const byDate = useMemo(() => summarizeByDate(activities), [activities]);

  const weekStart = useMemo(() => startOfWeek(focusedDate), [focusedDate]);
  const weekEnd = useMemo(() => endOfWeek(focusedDate), [focusedDate]);

  const rangeLabel = useMemo(() => {
    if (view === "day") return focusedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    if (view === "month") return focusedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    const s = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const e = weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${s} – ${e}`;
  }, [focusedDate, view, weekEnd, weekStart]);

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const monthDays = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(focusedDate));
    const gridEnd = endOfWeek(endOfMonth(focusedDate));
    const days: Date[] = [];
    for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);
    return days;
  }, [focusedDate]);

  const filtered = useMemo(() => {
    if (view === "day") {
      const key = toDateKey(focusedDate);
      return activities.filter((a) => a.dateKey === key);
    }
    const from = toDateKey(view === "month" ? startOfMonth(focusedDate) : weekStart);
    const to = toDateKey(view === "month" ? endOfMonth(focusedDate) : weekEnd);
    const inRange = activities.filter((a) => a.dateKey >= from && a.dateKey <= to);
    return selectedDateKey ? inRange.filter((a) => a.dateKey === selectedDateKey) : inRange;
  }, [activities, focusedDate, selectedDateKey, view, weekEnd, weekStart]);

  const grouped = useMemo(() => groupActivitiesByDate(filtered), [filtered]);

  const navigate = (direction: -1 | 1) => {
    setSelectedDateKey(null);
    setFocusedDate((d) => {
      if (view === "day") return addDays(d, direction);
      if (view === "week") return addDays(d, direction * 7);
      return new Date(d.getFullYear(), d.getMonth() + direction, 1);
    });
  };

  const goToday = () => {
    setSelectedDateKey(null);
    setFocusedDate(new Date());
  };

  if (subs.isLoading || txs.isLoading) return <PageLoading />;
  if (subs.error || txs.error) return <PageError message="We couldn't load your calendar." onRetry={() => { void subs.refetch(); void txs.refetch(); }} />;

  const toggleDay = (key: string) => setSelectedDateKey((prev) => (prev === key ? null : key));

  const DayCell = ({ date, compact }: { date: Date; compact?: boolean }) => {
    const key = toDateKey(date);
    const isToday = key === todayKey;
    const isSelected = selectedDateKey === key;
    const muted = !sameMonth(date, focusedDate);
    const s = byDate.get(key);
    return (
      <button
        type="button"
        onClick={() => toggleDay(key)}
        aria-pressed={isSelected}
        aria-label={`${date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}${s ? `, ${s.count} activities` : ""}`}
        className={cn(
          "flex flex-col rounded-2xl border p-2.5 text-left transition-colors sm:p-3",
          compact ? "min-h-[84px]" : "min-h-[104px]",
          isSelected ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong hover:bg-surface-2",
          muted && !isSelected && "opacity-50"
        )}
      >
        <div className="flex items-start justify-between">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold", isToday ? "bg-primary text-primary-fg" : "text-ink")}>{date.getDate()}</span>
          {s && s.count > 0 && <span className="rounded-full bg-surface-3 px-1.5 py-0.5 text-[10px] font-semibold text-ink-2">{s.count}</span>}
        </div>
        <div className="mt-auto pt-2 text-[11px] leading-4">
          {s ? (
            <>
              {s.outflow > 0 && <p className="tabular truncate font-semibold text-ink">-{formatCurrency(s.outflow, "USD", { compact: s.outflow >= 1000 })}</p>}
              {s.inflow > 0 && <p className="tabular truncate font-semibold text-good">+{formatCurrency(s.inflow, "USD", { compact: s.inflow >= 1000 })}</p>}
            </>
          ) : (
            <p className="text-muted">—</p>
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Planning"
        title="Calendar"
        description="Transactions and renewals laid out by day, week, and month."
        actions={
          <Segmented<CalendarViewMode>
            ariaLabel="Calendar view"
            value={view}
            onChange={(v) => {
              setView(v);
              setSelectedDateKey(null);
            }}
            options={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
          />
        }
      />

      <Card padding="md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Selected range</p>
            <h2 className="mt-1 text-xl font-bold">{rangeLabel}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={goToday}>
              Today
            </Button>
            <Button variant="secondary" size="icon" onClick={() => navigate(-1)} aria-label="Previous">
              <ChevronLeft size={18} />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => navigate(1)} aria-label="Next">
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>

        {view === "week" && (
          <div className="mt-5 grid grid-cols-7 gap-2">
            {weekDays.map((date) => (
              <div key={toDateKey(date)} className="flex flex-col gap-1.5">
                <p className="eyebrow text-center">{WEEK_DAYS[date.getDay()]}</p>
                <DayCell date={date} />
              </div>
            ))}
          </div>
        )}

        {view === "month" && (
          <div className="mt-5 space-y-2">
            <div className="grid grid-cols-7 gap-2">
              {WEEK_DAYS.map((d) => (
                <p key={d} className="eyebrow text-center">
                  {d}
                </p>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((date) => (
                <DayCell key={toDateKey(date)} date={date} compact />
              ))}
            </div>
          </div>
        )}

        {view === "day" && (
          <p className="mt-4 text-sm text-muted">
            {filtered.length === 0 ? "Nothing on this day." : `${filtered.length} ${filtered.length === 1 ? "item" : "items"} on this day.`}
          </p>
        )}

        {selectedDateKey && view !== "day" && (
          <p className="mt-4 text-xs text-muted">
            Showing a single day.{" "}
            <button type="button" onClick={() => setSelectedDateKey(null)} className="font-semibold text-brand hover:underline">
              Show the whole {view}
            </button>
          </p>
        )}
      </Card>

      <ActivityFeed groupedActivities={grouped} total={filtered.length} rangeLabel={rangeLabel} />
    </div>
  );
}
