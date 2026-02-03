import { useMemo } from "react";
import { useSubscriptions } from "@sdk/requests";
import { CURRENT_USER_ID } from "@/lib/constants";
import { PageLoading, PageError } from "@/components/PageState";
import {
  SubscriptionSection,
  groupSubscriptionsByBilling,
} from "@/components/Subscriptions";

export const SubscriptionPage = () => {
  const { data: subscriptions = [], isLoading, error } =
    useSubscriptions(CURRENT_USER_ID);

  const { upcoming, past } = useMemo(
    () => groupSubscriptionsByBilling(subscriptions),
    [subscriptions]
  );

  if (isLoading) return <PageLoading />;
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
