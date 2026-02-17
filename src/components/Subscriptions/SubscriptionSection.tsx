import type { Subscription } from "@sdk/db";
import { formatDate, formatSubscriptionAmount } from "@/lib/format";

interface SubscriptionSectionProps {
  title: string;
  subscriptions: Subscription[];
}

function getStatusStyles(status: string): string {
  const s = (status ?? "").toLowerCase();
  if (s === "active" || s === "upcoming") return "bg-emerald-50 text-emerald-700";
  if (s === "cancelled" || s === "past") return "bg-zinc-100 text-zinc-600";
  return "bg-amber-50 text-amber-700";
}

export const SubscriptionSection = ({ title, subscriptions }: SubscriptionSectionProps) => (
  <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
    <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
    </div>
    <div className="overflow-x-auto scrollbar-hide">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-zinc-100 bg-zinc-50/50">
            <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Name
            </th>
            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Billing cycle
            </th>
            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Next billing
            </th>
            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Status
            </th>
            <th className="px-4 py-3.5 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-12 text-center text-sm text-zinc-500"
              >
                No subscriptions in this section.
              </td>
            </tr>
          ) : (
            subscriptions.map((sub) => (
              <tr
                key={sub.id}
                className="border-b border-zinc-100 transition-colors last:border-b-0 hover:bg-zinc-50/80"
              >
                <td className="py-4 pl-6 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-zinc-900">{sub.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm capitalize text-zinc-500">
                  {sub.billing_cycle ?? "—"}
                </td>
                <td className="whitespace-nowrap py-4 px-4 text-sm text-zinc-600">
                  {formatDate(sub.next_billing_date)}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusStyles(sub.status)}`}
                  >
                    {sub.status ?? "—"}
                  </span>
                </td>
                <td className="py-4 pl-4 pr-6 text-right text-sm font-semibold tabular-nums text-brand-green">
                  {formatSubscriptionAmount(sub.amount, sub.currency)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);
