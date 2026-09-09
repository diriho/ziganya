import { Repeat2, ReceiptText, CalendarX2 } from "lucide-react";
import { Badge, Card, CardHeader, EmptyState, cn } from "@/components/ui";
import { formatCurrency, formatLongDate } from "@/lib/format";
import type { CalendarActivity } from "./types";

interface ActivityFeedProps {
  groupedActivities: [string, CalendarActivity[]][];
  total: number;
  rangeLabel: string;
}

export function ActivityFeed({ groupedActivities, total, rangeLabel }: ActivityFeedProps) {
  return (
    <Card padding="md">
      <CardHeader title="Activity" subtitle={rangeLabel} action={<Badge tone="neutral">{total} {total === 1 ? "item" : "items"}</Badge>} />

      {groupedActivities.length === 0 ? (
        <EmptyState compact icon={<CalendarX2 size={20} />} title="Nothing scheduled" description="No transactions or renewals fall in this range." />
      ) : (
        <div className="space-y-6">
          {groupedActivities.map(([dateKey, items]) => {
            const dayOut = items.filter((i) => i.outflow).reduce((s, i) => s + i.amount, 0);
            return (
              <section key={dateKey} aria-label={formatLongDate(dateKey)}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-ink">{formatLongDate(dateKey)}</h3>
                  {dayOut > 0 && <p className="tabular text-xs text-muted">{formatCurrency(dayOut, items[0].currency)} out</p>}
                </div>
                <ul className="divide-y divide-line rounded-2xl border border-line">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", item.type === "subscription" ? "bg-brand-soft text-brand" : "bg-surface-2 text-ink-2")}>
                          {item.type === "subscription" ? <Repeat2 size={16} /> : <ReceiptText size={16} />}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                          <p className="truncate text-xs text-muted">{item.subtitle}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={cn("tabular text-sm font-semibold", item.outflow ? "text-ink" : "text-good")}>
                          {item.outflow ? "-" : "+"}
                          {formatCurrency(item.amount, item.currency)}
                        </p>
                        <p className="text-[11px] capitalize text-muted">{item.status}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </Card>
  );
}
