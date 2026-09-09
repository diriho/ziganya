import { describe, expect, it } from "vitest";
import type { Budget, Subscription, Transaction } from "@sdk/db";
import {
  bucketTransactions,
  budgetStatus,
  categoryBreakdown,
  monthlyCostOf,
  monthlyKpis,
  percentChange,
  pickOverallBudget,
  projectedCharges,
  subscriptionSummary,
  topMerchant,
  totalsOf,
  upcomingRenewals,
} from "../analytics";
import { resolveRange, toDateKey } from "../dates";

const TODAY = new Date(2026, 8, 8); // Tue Sep 8 2026 (local)

let seq = 0;
function tx(over: Partial<Transaction>): Transaction {
  seq += 1;
  return {
    id: `tx-${seq}`,
    user_id: "u1",
    amount: 10,
    type: "expense",
    transaction_date: "2026-09-08",
    created_at: "2026-09-08T10:00:00Z",
    currency: "USD",
    source: "manual",
    merchant_name: null,
    merchant_id: null,
    category_id: null,
    description: null,
    notes: null,
    confidence: null,
    is_verified: false,
    ...over,
  };
}

function sub(over: Partial<Subscription>): Subscription {
  seq += 1;
  return {
    id: `sub-${seq}`,
    user_id: "u1",
    name: "Service",
    amount: 10,
    billing_cycle: "monthly",
    billing_day: null,
    category_id: null,
    merchant_id: null,
    currency: "USD",
    created_at: "2026-01-01T00:00:00Z",
    next_billing_date: "2026-09-10",
    status: "active",
    ...over,
  };
}

describe("totalsOf / percentChange", () => {
  it("separates income from expenses and computes net", () => {
    const t = totalsOf([
      tx({ amount: 100, type: "expense" }),
      tx({ amount: 250, type: "income" }),
      tx({ amount: -25.5, type: "EXPENSE" }), // negative magnitude + odd casing
    ]);
    expect(t.expense).toBe(125.5);
    expect(t.income).toBe(250);
    expect(t.net).toBe(124.5);
    expect(t.count).toBe(3);
  });

  it("returns null percent change without a baseline", () => {
    expect(percentChange(50, 0)).toBeNull();
    expect(percentChange(150, 100)).toBe(50);
    expect(percentChange(75, 100)).toBe(-25);
  });
});

describe("bucketTransactions", () => {
  it("zero-fills 7 daily buckets and ignores out-of-range rows", () => {
    const range = resolveRange("7d", TODAY);
    const rows = [
      tx({ amount: 12, transaction_date: "2026-09-08" }),
      tx({ amount: 8, transaction_date: "2026-09-08" }),
      tx({ amount: 30, transaction_date: "2026-09-02" }),
      tx({ amount: 99, transaction_date: "2026-09-01" }), // outside (7d = Sep 2..8)
      tx({ amount: 500, type: "income", transaction_date: "2026-09-05" }),
    ];
    const buckets = bucketTransactions(rows, range);
    expect(buckets).toHaveLength(7);
    expect(buckets[0].key).toBe("2026-09-02");
    expect(buckets[6].key).toBe("2026-09-08");
    expect(buckets[6].expense).toBe(20);
    expect(buckets[0].expense).toBe(30);
    expect(buckets.find((b) => b.key === "2026-09-05")?.income).toBe(500);
    expect(buckets.reduce((s, b) => s + b.expense, 0)).toBe(50);
    expect(buckets.filter((b) => b.count === 0)).toHaveLength(4);
  });

  it("uses weekly buckets for 3 months, clipped to the range", () => {
    const range = resolveRange("3m", TODAY); // Jun 11 .. Sep 8
    const buckets = bucketTransactions(
      [tx({ amount: 10, transaction_date: "2026-06-11" }), tx({ amount: 5, transaction_date: "2026-09-08" })],
      range
    );
    expect(range.bucket).toBe("week");
    expect(buckets[0].key).toBe(toDateKey(range.from));
    expect(buckets[0].expense).toBe(10);
    expect(buckets[buckets.length - 1].expense).toBe(5);
    // 90 days starting on a Thursday spans 14 Sunday-anchored weeks
    expect(buckets.length).toBe(14);
    // keys strictly increasing
    for (let i = 1; i < buckets.length; i++) expect(buckets[i].key > buckets[i - 1].key).toBe(true);
  });
});

describe("categoryBreakdown", () => {
  it("ranks categories, folds the tail into Other, shares sum to 1", () => {
    const cats = ["a", "b", "c", "d", "e", "f", "g"].map((id) => ({ id, name: id.toUpperCase(), color: null }));
    const rows = cats.flatMap((c, i) => [tx({ amount: (i + 1) * 10, category_id: c.id })]);
    rows.push(tx({ amount: 7 })); // uncategorized
    rows.push(tx({ amount: 1000, type: "income", category_id: "a" })); // ignored
    const out = categoryBreakdown(rows, cats, 5);
    expect(out).toHaveLength(6);
    expect(out[0].name).toBe("G");
    expect(out[0].amount).toBe(70);
    expect(out[5].name).toMatch(/^Other \(3\)/);
    expect(out[5].amount).toBe(10 + 20 + 7);
    const total = out.reduce((s, c) => s + c.share, 0);
    expect(total).toBeCloseTo(1, 6);
  });

  it("returns empty when there are no expenses", () => {
    expect(categoryBreakdown([tx({ type: "income" })], [], 5)).toEqual([]);
  });
});

describe("monthlyKpis", () => {
  it("compares month-to-date against the same point last month", () => {
    const rows = [
      tx({ amount: 100, transaction_date: "2026-09-03" }),
      tx({ amount: 50, transaction_date: "2026-09-08" }),
      tx({ amount: 300, type: "income", transaction_date: "2026-09-01" }),
      tx({ amount: 100, transaction_date: "2026-08-05" }), // in prev same-point window (Aug 1..8)
      tx({ amount: 400, transaction_date: "2026-08-20" }), // prev month but after same point
    ];
    const k = monthlyKpis(rows, TODAY, 14);
    expect(k.monthToDate.expense).toBe(150);
    expect(k.monthToDate.net).toBe(150);
    expect(k.prevSamePoint.expense).toBe(100);
    expect(k.prevFullMonth.expense).toBe(500);
    expect(k.spendingChangePct).toBe(50);
    expect(k.spark).toHaveLength(14);
    expect(k.spark[13]).toBe(50);
  });
});

describe("subscriptions", () => {
  it("normalizes billing cycles to monthly cost", () => {
    expect(monthlyCostOf({ amount: 120, billing_cycle: "yearly" })).toBe(10);
    expect(monthlyCostOf({ amount: 30, billing_cycle: "quarterly" })).toBe(10);
    expect(monthlyCostOf({ amount: 12, billing_cycle: "weekly" })).toBeCloseTo(52);
    expect(monthlyCostOf({ amount: 9.99, billing_cycle: "monthly" })).toBe(9.99);
  });

  it("summarizes only active subscriptions", () => {
    const s = subscriptionSummary([
      sub({ amount: 10 }),
      sub({ amount: 120, billing_cycle: "annual" }),
      sub({ amount: 50, status: "cancelled" }),
    ]);
    expect(s.activeCount).toBe(2);
    expect(s.totalCount).toBe(3);
    expect(s.monthlyCost).toBe(20);
    expect(s.yearlyCost).toBe(240);
  });

  it("lists renewals within the window, soonest first, skipping cancelled", () => {
    const r = upcomingRenewals(
      [
        sub({ name: "B", next_billing_date: "2026-09-12" }),
        sub({ name: "A", next_billing_date: "2026-09-08" }),
        sub({ name: "Late", next_billing_date: "2026-09-20" }),
        sub({ name: "Past", next_billing_date: "2026-09-07" }),
        sub({ name: "Gone", next_billing_date: "2026-09-09", status: "cancelled" }),
      ],
      7,
      TODAY
    );
    expect(r.map((x) => x.sub.name)).toEqual(["A", "B"]);
    expect(r[0].daysUntil).toBe(0);
    expect(r[1].daysUntil).toBe(4);
  });

  it("projects charges per month honoring cycle and anchor", () => {
    const rows = projectedCharges(
      [
        sub({ amount: 10, billing_cycle: "monthly", next_billing_date: "2026-09-15" }),
        sub({ amount: 120, billing_cycle: "yearly", next_billing_date: "2026-11-01" }),
        sub({ amount: 30, billing_cycle: "quarterly", next_billing_date: "2026-10-01" }),
      ],
      6,
      TODAY
    );
    expect(rows.map((r) => r.label)).toEqual(["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]);
    expect(rows.map((r) => r.amount)).toEqual([10, 40, 130, 10, 40, 10]);
  });
});

describe("budgets", () => {
  const budget = (over: Partial<Budget>): Budget => ({
    id: "b1",
    user_id: "u1",
    amount: 1000,
    period: "monthly",
    category_id: null,
    alert_enabled: true,
    alert_threshold: 80,
    created_at: "2026-01-01T00:00:00Z",
    ...over,
  });

  it("prefers the uncategorized monthly budget", () => {
    const b = pickOverallBudget([budget({ id: "cat", category_id: "c1" }), budget({ id: "all" })]);
    expect(b?.id).toBe("all");
    expect(pickOverallBudget([])).toBeNull();
  });

  it("derives state from the alert threshold in either 0.8 or 80 form", () => {
    expect(budgetStatus(budget({}), 500).state).toBe("good");
    expect(budgetStatus(budget({}), 850).state).toBe("warn");
    expect(budgetStatus(budget({ alert_threshold: 0.8 }), 850).state).toBe("warn");
    expect(budgetStatus(budget({}), 1200).state).toBe("over");
    expect(budgetStatus(budget({}), 1200).remaining).toBe(0);
    expect(budgetStatus(null, 300).limit).toBe(0);
    expect(budgetStatus(null, 300).ratio).toBe(0);
  });
});

describe("topMerchant", () => {
  it("sums expense amounts per merchant", () => {
    const m = topMerchant([
      tx({ amount: 10, merchant_name: "Cafe" }),
      tx({ amount: 30, merchant_name: "Market" }),
      tx({ amount: 25, merchant_name: "Cafe" }),
      tx({ amount: 900, merchant_name: "Employer", type: "income" }),
    ]);
    expect(m).toEqual({ name: "Cafe", amount: 35 });
  });
});
