import { Repeat2, ReceiptText } from "lucide-react";
import { formatLongDate, formatAmount } from "@/lib/format";
import type { CalendarActivity } from "./types";

interface ActivityFeedProps {
  groupedActivities: [string, CalendarActivity[]][];
  total: number;
}

export const ActivityFeed = ({ groupedActivities, total }: ActivityFeedProps) => (
  <div className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-bold text-zinc-900">Activities</h3>
      <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-600">
        {total} total
      </span>
    </div>

    {groupedActivities.length === 0 ? (
      <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-10 text-center text-sm text-zinc-500">
        No activities for this range.
      </p>
    ) : (
      <div className="space-y-6">
        {groupedActivities.map(([dateKey, items]) => (
          <div key={dateKey} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-800">{formatLongDate(dateKey)}</p>
              <p className="text-xs font-medium text-zinc-500">{items.length} items</p>
            </div>
            <div className="space-y-2">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4 transition hover:border-zinc-300 hover:bg-zinc-50/70"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                        item.type === "subscription"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {item.type === "subscription" ? (
                        <Repeat2 size={18} />
                      ) : (
                        <ReceiptText size={18} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-zinc-900">{item.title}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {item.type === "subscription" ? "Subscription" : "Transaction"} •{" "}
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="ml-3 text-right">
                    <p className="text-sm font-semibold text-zinc-900">
                      {formatAmount(item.amount, item.currency)}
                    </p>
                    <p className="text-xs capitalize text-zinc-500">{item.status}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

