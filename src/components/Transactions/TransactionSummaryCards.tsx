import { formatCurrency } from "@/lib/format";

export interface TransactionSummaryCardsProps {
  income: number;
  expenses: number;
}

const cards = [
  {
    label: "Income",
    value: (income: number) => formatCurrency(income, "USD"),
    text: "text-emerald-700",
    bg: "bg-emerald-50/80",
  },
  {
    label: "Expenses",
    value: (_income: number, expenses: number) => formatCurrency(expenses, "USD"),
    text: "text-amber-700",
    bg: "bg-amber-50/80",
  },
  {
    label: "Net",
    value: (income: number, expenses: number) => formatCurrency(income - expenses, "USD"),
    text: "text-zinc-800",
    bg: "bg-zinc-50/80",
  },
];

export const TransactionSummaryCards = ({ income, expenses }: TransactionSummaryCardsProps) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    {cards.map(({ label, value, text, bg }) => (
      <div
        key={label}
        className={`rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${bg}`}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </p>
        <p className={`mt-2 text-xl font-semibold tabular-nums ${text}`}>
          {value(income, expenses)}
        </p>
      </div>
    ))}
  </div>
);
