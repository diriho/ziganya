import { useMemo, useState } from "react";
import { BarChart3, Eye, EyeOff, Plus, Table2 } from "lucide-react";
import type { Category, Transaction } from "@sdk/db";
import { Button, Card, CardHeader, EmptyState, Segmented, cn } from "@/components/ui";
import { ChartTable, SpendingChart } from "@/components/charts";
import { bucketTransactions, categoryBreakdown, filterByRange, percentChange, totalsOf, type Bucket } from "@/lib/analytics";
import type { AnalyticsRange } from "@/lib/dates";
import { formatCurrency, formatPercent } from "@/lib/format";

export interface SpendingAnalyticsProps {
  transactions: Transaction[];
  categories: Category[];
  range: AnalyticsRange;
  currency: string;
  onAddTransaction?: () => void;
}

type View = "chart" | "table";

export function SpendingAnalytics({ transactions, categories, range, currency, onAddTransaction }: SpendingAnalyticsProps) {
  const [view, setView] = useState<View>("chart");
  const [showIncome, setShowIncome] = useState(false);

  const { buckets, totals, prevTotals, change, dailyAvg, topCategory } = useMemo(() => {
    const current = filterByRange(transactions, range.from, range.to);
    const previous = filterByRange(transactions, range.prevFrom, range.prevTo);
    const totals = totalsOf(current);
    const prevTotals = totalsOf(previous);
    return {
      buckets: bucketTransactions(current, range),
      totals,
      prevTotals,
      change: percentChange(totals.expense, prevTotals.expense),
      dailyAvg: totals.expense / range.days,
      topCategory: categoryBreakdown(current, categories, 1)[0] ?? null,
    };
  }, [transactions, categories, range]);

  const periodWord = range.preset === "7d" ? "week" : range.preset === "30d" ? "30 days" : "3 months";
  const isEmpty = totals.count === 0;
  const hasIncome = totals.income > 0;

  return (
    <Card padding="md" className="flex h-full flex-col">
      <CardHeader
        title="Spending analytics"
        subtitle={`${range.bucket === "week" ? "Weekly" : "Daily"} spending${showIncome && hasIncome ? " with income for context" : ""}`}
        action={
          !isEmpty && (
            <>
              {hasIncome && view === "chart" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIncome((v) => !v)}
                  aria-pressed={showIncome}
                  leftIcon={showIncome ? <EyeOff size={14} /> : <Eye size={14} />}
                  className="text-xs"
                >
                  {showIncome ? "Hide income" : "Show income"}
                </Button>
              )}
              <Segmented<View>
              size="sm"
              ariaLabel="Analytics view"
              value={view}
              onChange={setView}
              options={[
                { value: "chart", label: "Chart", icon: <BarChart3 size={14} /> },
                { value: "table", label: "Table", icon: <Table2 size={14} /> },
              ]}
            />
            </>
          )
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={<BarChart3 size={22} />}
          title={`No transactions in the last ${periodWord}`}
          description="Add a transaction or upload a receipt and your spending will show up here."
          action={
            onAddTransaction && (
              <Button onClick={onAddTransaction} leftIcon={<Plus size={16} />}>
                Add transaction
              </Button>
            )
          }
        />
      ) : (
        <>
          <dl className="mb-5 grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
            <Stat label="Total spent" value={formatCurrency(totals.expense, currency)} />
            <Stat label="Daily average" value={formatCurrency(dailyAvg, currency)} />
            <Stat
              label={`vs prior ${periodWord}`}
              value={change === null ? "—" : formatPercent(change, change !== 0 && Math.abs(change) < 10 ? 1 : 0)}
              valueClass={change === null ? "text-muted" : change > 0 ? "text-danger" : change < 0 ? "text-good" : undefined}
              sub={change === null ? "No prior data" : `${formatCurrency(prevTotals.expense, currency)} before`}
            />
            <Stat
              label="Top category"
              value={topCategory ? topCategory.name : "—"}
              sub={topCategory ? `${formatCurrency(topCategory.amount, currency)} · ${Math.round(topCategory.share * 100)}%` : undefined}
              truncate
            />
          </dl>

          {view === "chart" ? (
            <SpendingChart data={buckets} currency={currency} height={272} showIncome={showIncome} />
          ) : (
            <ChartTable<Bucket>
              caption="Spending and income by period"
              rows={buckets}
              rowKey={(b) => b.key}
              columns={[
                { key: "period", label: "Period", render: (b) => b.longLabel },
                { key: "expense", label: "Spending", align: "right", render: (b) => formatCurrency(b.expense, currency) },
                { key: "income", label: "Income", align: "right", render: (b) => formatCurrency(b.income, currency) },
                { key: "count", label: "Transactions", align: "right", render: (b) => b.count },
              ]}
            />
          )}
        </>
      )}
    </Card>
  );
}

function Stat({ label, value, sub, valueClass, truncate }: { label: string; value: string; sub?: string; valueClass?: string; truncate?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow">{label}</dt>
      <dd className={cn("mt-1 font-display text-lg font-bold leading-tight sm:text-xl", valueClass, truncate && "truncate")} title={truncate ? value : undefined}>
        {value}
      </dd>
      {sub && <dd className="mt-0.5 truncate text-xs text-muted">{sub}</dd>}
    </div>
  );
}
