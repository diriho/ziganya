import { useMemo } from "react";
import { PieChart } from "lucide-react";
import type { Category, Transaction } from "@sdk/db";
import { Card, CardHeader, EmptyState } from "@/components/ui";
import { CategoryBars } from "@/components/charts";
import { categoryBreakdown, filterByRange } from "@/lib/analytics";
import type { AnalyticsRange } from "@/lib/dates";

export function CategoryBreakdown({
  transactions,
  categories,
  range,
  currency,
}: {
  transactions: Transaction[];
  categories: Category[];
  range: AnalyticsRange;
  currency: string;
}) {
  const slices = useMemo(
    () => categoryBreakdown(filterByRange(transactions, range.from, range.to), categories, 5),
    [transactions, categories, range]
  );

  return (
    <Card padding="md" className="flex h-full flex-col">
      <CardHeader title="By category" subtitle="Share of spending in the selected period" />
      {slices.length === 0 ? (
        <EmptyState compact icon={<PieChart size={20} />} title="Nothing to break down yet" description="Categorize your expenses to see where the money goes." />
      ) : (
        <CategoryBars slices={slices} currency={currency} />
      )}
    </Card>
  );
}
