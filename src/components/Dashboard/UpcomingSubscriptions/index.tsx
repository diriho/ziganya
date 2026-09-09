import { useMemo } from "react";
import { Link } from "react-router";
import { ArrowRight, CreditCard } from "lucide-react";
import type { Subscription } from "@sdk/db";
import { Badge, Card, CardHeader, EmptyState, LinkButton } from "@/components/ui";
import { isActiveSubscription, subscriptionSummary } from "@/lib/analytics";
import { dateKeyOf, parseDateKey, startOfDay } from "@/lib/dates";
import { formatCurrency, formatRelativeDay, initialsOf } from "@/lib/format";

export function UpcomingSubscriptions({ subscriptions, currency, limit = 5 }: { subscriptions: Subscription[]; currency: string; limit?: number }) {
  const summary = useMemo(() => subscriptionSummary(subscriptions), [subscriptions]);

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    return subscriptions
      .filter(isActiveSubscription)
      .map((sub) => {
        const key = dateKeyOf(sub.next_billing_date);
        const days = key ? Math.round((parseDateKey(key).getTime() - today.getTime()) / 86_400_000) : null;
        return { sub, key, days };
      })
      .filter((x) => x.days !== null && x.days >= 0)
      .sort((a, b) => (a.days ?? 0) - (b.days ?? 0))
      .slice(0, limit);
  }, [subscriptions, limit]);

  return (
    <Card padding="md" className="flex h-full flex-col">
      <CardHeader
        title="Upcoming renewals"
        subtitle={
          summary.activeCount > 0
            ? `${summary.activeCount} active · ${formatCurrency(summary.monthlyCost, currency)}/mo`
            : "Recurring payments you're tracking"
        }
        action={
          <Link to="/dashboard/subscriptions" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        }
      />

      {upcoming.length === 0 ? (
        <EmptyState
          compact
          icon={<CreditCard size={20} />}
          title={summary.activeCount > 0 ? "No renewals scheduled" : "No subscriptions yet"}
          description={summary.activeCount > 0 ? "Add a next billing date to see renewals here." : "Track Netflix, rent, gym — anything recurring."}
          action={
            <LinkButton to="/dashboard/subscriptions" variant="secondary" size="sm">
              Manage subscriptions
            </LinkButton>
          }
        />
      ) : (
        <ul className="-mx-2 divide-y divide-line">
          {upcoming.map(({ sub, key, days }) => (
            <li key={sub.id} className="flex items-center gap-3 px-2 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-bold text-accent dark:bg-brand-soft dark:text-brand">
                {initialsOf(sub.name, "S").slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{sub.name}</p>
                <p className="truncate text-xs capitalize text-muted">{sub.billing_cycle ?? "monthly"}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="tabular text-sm font-semibold">{formatCurrency(sub.amount, sub.currency || currency)}</p>
                <Badge tone={days !== null && days <= 2 ? "warn" : "neutral"} size="sm">
                  {formatRelativeDay(key)}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
