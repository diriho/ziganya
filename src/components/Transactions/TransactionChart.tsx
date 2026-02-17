import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Transaction } from "@sdk/db";
import { formatDate } from "@/lib/format";

/** Pre-aggregated chart data: use this shape to reuse the chart with subscriptions or other sources. */
export interface ChartDataPoint {
  date: string;
  dateKey: string;
  income: number;
  expense: number;
}

interface TransactionChartProps {
  /** When provided, used directly (e.g. for subscriptions). Otherwise computed from transactions. */
  chartData?: ChartDataPoint[];
  transactions?: Transaction[];
  title?: string;
  emptyMessage?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const DEFAULT_TITLE = "Income vs expenses over time";
const DEFAULT_EMPTY = "No transaction data to display. Add or filter transactions to see the chart.";

export function TransactionChart({
  chartData: chartDataProp,
  transactions = [],
  title = DEFAULT_TITLE,
  emptyMessage = DEFAULT_EMPTY,
}: TransactionChartProps) {
  const chartDataFromTransactions = useMemo(() => {
    const byDate = new Map<string, { income: number; expense: number }>();

    for (const tx of transactions) {
      const dateKey = tx.transaction_date?.slice(0, 10) ?? "";
      if (!dateKey) continue;
      if (!byDate.has(dateKey)) byDate.set(dateKey, { income: 0, expense: 0 });
      const row = byDate.get(dateKey)!;
      const isExpense = tx.type?.toLowerCase() === "expense";
      if (isExpense) row.expense += tx.amount;
      else row.income += tx.amount;
    }

    return Array.from(byDate.entries())
      .map(([dateKey, row]) => ({
        date: formatDate(dateKey),
        dateKey,
        income: Math.round(row.income * 100) / 100,
        expense: Math.round(row.expense * 100) / 100,
      }))
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [transactions]);

  const chartData = chartDataProp ?? chartDataFromTransactions;

  if (chartData.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          {title}
        </h3>
        <div className="flex h-[320px] items-center justify-center text-sm text-zinc-500">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 16, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis
            width={56}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
          />
          <Tooltip
            formatter={(value: number | undefined) => [value != null ? formatCurrency(value) : "", ""]}
            labelFormatter={(label) => label}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="expense"
            name="Expenses"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
