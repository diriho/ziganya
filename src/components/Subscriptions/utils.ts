import type { Subscription } from "@sdk/db";

const todayISO = () => new Date().toISOString().slice(0, 10);

export function groupSubscriptionsByBilling(subscriptions: Subscription[]) {
  const now = todayISO();
  const upcoming: Subscription[] = [];
  const past: Subscription[] = [];

  const sorted = [...subscriptions].sort(
    (a, b) => (a.next_billing_date ?? "").localeCompare(b.next_billing_date ?? "")
  );

  sorted.forEach((sub) => {
    const date = sub.next_billing_date ?? "";
    if (date >= now) upcoming.push(sub);
    else past.push(sub);
  });

  upcoming.sort((a, b) =>
    (a.next_billing_date ?? "").localeCompare(b.next_billing_date ?? "")
  );
  past.sort((a, b) =>
    (b.next_billing_date ?? "").localeCompare(a.next_billing_date ?? "")
  );

  return { upcoming, past };
}
