import type { Subscription } from "@sdk/db";
import { isActiveSubscription } from "@/lib/analytics";
import { dateKeyOf, toDateKey } from "@/lib/dates";

/** Split into active (sorted by next renewal, overdue first) and inactive (paused/cancelled). */
export function groupSubscriptions(subscriptions: Subscription[]) {
  const active: Subscription[] = [];
  const inactive: Subscription[] = [];
  for (const sub of subscriptions) (isActiveSubscription(sub) ? active : inactive).push(sub);
  const byDate = (a: Subscription, b: Subscription) => (dateKeyOf(a.next_billing_date) ?? "9999").localeCompare(dateKeyOf(b.next_billing_date) ?? "9999");
  active.sort(byDate);
  inactive.sort((a, b) => a.name.localeCompare(b.name));
  return { active, inactive };
}

export function isOverdue(sub: Subscription, today = new Date()): boolean {
  const key = dateKeyOf(sub.next_billing_date);
  return !!key && key < toDateKey(today) && isActiveSubscription(sub);
}
