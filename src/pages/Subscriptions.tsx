import { useMemo } from "react";
import { useCurrentUser, useSubscriptions } from "@sdk/requests";
import { PageLoading, PageError } from "@/components/PageState";
import {
  SubscriptionSection,
  groupSubscriptionsByBilling,
} from "@/components/Subscriptions";
import { TransactionChart, type ChartDataPoint } from "@/components/Transactions";
import { formatDate } from "@/lib/format";

export const SubscriptionPage = () => {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { data: subscriptions = [], isLoading, error } =
    useSubscriptions(user?.userID ?? "");

  const { upcoming, past } = useMemo(
    () => groupSubscriptionsByBilling(subscriptions),
    [subscriptions]
  );

  const subscriptionChartData = useMemo((): ChartDataPoint[] => {
    const byDate = new Map<string, number>();
    for (const sub of subscriptions) {
      const dateKey = sub.next_billing_date?.slice(0, 10) ?? sub.created_at?.slice(0, 10) ?? "";
      if (!dateKey) continue;
      byDate.set(dateKey, (byDate.get(dateKey) ?? 0) + sub.amount);
    }
    return Array.from(byDate.entries())
      .map(([dateKey, amount]) => ({
        date: formatDate(dateKey),
        dateKey,
        income: 0,
        expense: Math.round(amount * 100) / 100,
      }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [subscriptions]);

  if (userLoading || isLoading) return <PageLoading />;
  if (error) return <PageError message="Error loading subscriptions." />;

  const hasAny = upcoming.length > 0 || past.length > 0;

  return (
    <section className="space-y-6" aria-labelledby="subscriptions-title">
      <header className="space-y-2">
        <h1 id="subscriptions-title" className="text-2xl font-semibold text-zinc-900">
          Your Subscriptions
        </h1>
        <p className="text-sm text-zinc-500">
          Upcoming and past billing.
        </p>
      </header>

      {hasAny && (
        <TransactionChart
          chartData={subscriptionChartData}
          title="Subscription costs by date"
          emptyMessage="No subscription data to display."
        />
      )}

      {!hasAny && (
        <p className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-500 shadow-sm">
          No subscriptions yet.
        </p>
      )}

      {upcoming.length > 0 && (
        <SubscriptionSection title="Upcoming" subscriptions={upcoming} />
      )}

      {upcoming.length === 0 && hasAny && (
        <p className="text-sm text-zinc-500">No upcoming subscriptions.</p>
      )}

      {past.length > 0 && (
        <SubscriptionSection title="Past charges" subscriptions={past} />
      )}
    </section>
  );
};
