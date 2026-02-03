import type { Subscription } from "@sdk/db";
import { SubscriptionItem } from "@/components/Dashboard/Subscriptions";
import { formatDate, formatSubscriptionAmount } from "@/lib/format";

interface SubscriptionSectionProps {
  title: string;
  subscriptions: Subscription[];
}

export const SubscriptionSection = ({ title, subscriptions }: SubscriptionSectionProps) => (
  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
      {title}
    </h2>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {subscriptions.map((sub) => (
        <SubscriptionItem
          key={sub.id}
          name={sub.name}
          amount={formatSubscriptionAmount(sub.amount, sub.currency)}
          date={formatDate(sub.next_billing_date)}
        />
      ))}
    </div>
  </div>
);
