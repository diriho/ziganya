import { useMemo, useState } from "react";
import { CalendarClock, CreditCard, Plus } from "lucide-react";
import type { Subscription } from "@sdk/db";
import { useAuth } from "@sdk/auth";
import { useDeleteSubscription, useSubscriptions } from "@sdk/requests";
import { Button, Card, CardHeader, ConfirmDialog, EmptyState, PageHeader, useToast } from "@/components/ui";
import { PageError, PageLoading } from "@/components/PageState";
import { UpcomingChargesChart } from "@/components/charts";
import { StatTile } from "@/components/Dashboard/StatTile";
import { SubscriptionModal, SubscriptionTable, groupSubscriptions } from "@/components/Subscriptions";
import { projectedCharges, subscriptionSummary, upcomingRenewals } from "@/lib/analytics";
import { formatCurrency, formatRelativeDay } from "@/lib/format";

export function SubscriptionPage() {
  const { user } = useAuth();
  const userId = user?.userID ?? "";
  const toast = useToast();
  const { data: subscriptions = [], isLoading, error, refetch } = useSubscriptions(userId, 500);
  const remove = useDeleteSubscription(userId);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);

  const { active, inactive } = useMemo(() => groupSubscriptions(subscriptions), [subscriptions]);
  const summary = useMemo(() => subscriptionSummary(subscriptions), [subscriptions]);
  const projected = useMemo(() => projectedCharges(subscriptions, 6), [subscriptions]);
  const nextRenewal = useMemo(() => upcomingRenewals(subscriptions, 365)[0] ?? null, [subscriptions]);
  const currency = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of subscriptions) counts.set(s.currency || "USD", (counts.get(s.currency || "USD") ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "USD";
  }, [subscriptions]);

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success("Subscription removed", `${deleting.name} is no longer tracked.`);
      setDeleting(null);
    } catch (err) {
      toast.error("Could not delete", err instanceof Error ? err.message : undefined);
    }
  };

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message="We couldn't load your subscriptions." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Recurring"
        title="Subscriptions"
        description="Everything that bills you on a schedule, and what it adds up to."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => setCreating(true)}>
            Add subscription
          </Button>
        }
      />

      {subscriptions.length === 0 ? (
        <Card padding="none">
          <EmptyState
            icon={<CreditCard size={22} />}
            title="No subscriptions yet"
            description="Add streaming, rent, insurance, software — anything that renews. We'll total it up and remind you before it bills."
            action={
              <Button leftIcon={<Plus size={16} />} onClick={() => setCreating(true)}>
                Add your first subscription
              </Button>
            }
          />
        </Card>
      ) : (
        <>
          <section aria-label="Subscription totals" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile tone="brand" label="Monthly cost" value={formatCurrency(summary.monthlyCost, currency)} icon={<CreditCard size={18} />} hint={`${summary.activeCount} active subscription${summary.activeCount === 1 ? "" : "s"}`} className="min-h-[124px]" />
            <StatTile label="Yearly cost" value={formatCurrency(summary.yearlyCost, currency)} hint="Normalized across billing cycles" className="min-h-[124px]" />
            <StatTile label="Active" value={String(summary.activeCount)} hint={inactive.length > 0 ? `${inactive.length} paused or cancelled` : "All subscriptions are active"} className="min-h-[124px]" />
            <StatTile
              label="Next renewal"
              value={nextRenewal ? formatRelativeDay(nextRenewal.dateKey) : "—"}
              icon={<CalendarClock size={18} />}
              hint={nextRenewal ? `${nextRenewal.sub.name} · ${formatCurrency(nextRenewal.sub.amount, nextRenewal.sub.currency || currency)}` : "No upcoming dates"}
              className="min-h-[124px]"
            />
          </section>

          <Card padding="md">
            <CardHeader title="Projected charges" subtitle="What your active subscriptions will bill over the next six months" />
            <UpcomingChargesChart data={projected} currency={currency} height={220} />
          </Card>

          {active.length > 0 && (
            <SubscriptionTable title="Active" subtitle="Sorted by next renewal" subscriptions={active} currency={currency} onEdit={setEditing} onDelete={setDeleting} />
          )}
          {inactive.length > 0 && (
            <SubscriptionTable title="Paused & cancelled" subtitle="Not counted in totals" subscriptions={inactive} currency={currency} onEdit={setEditing} onDelete={setDeleting} />
          )}
        </>
      )}

      <SubscriptionModal open={creating} onClose={() => setCreating(false)} defaultCurrency={currency} />
      <SubscriptionModal open={!!editing} onClose={() => setEditing(null)} subscription={editing} defaultCurrency={currency} />
      <ConfirmDialog
        open={!!deleting}
        tone="danger"
        title="Remove this subscription?"
        description={deleting ? `${deleting.name} will no longer be tracked. Past transactions are not affected.` : undefined}
        confirmLabel="Remove"
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
