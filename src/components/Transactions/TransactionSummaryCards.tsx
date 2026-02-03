import { formatCurrency } from "@/lib/format";

export interface TransactionSummaryCardsProps {
  income: number;
  expenses: number;
}

const cards = [
  {
    label: "Income",
    value: (income: number) => formatCurrency(income, "USD"),
    accent: "from-emerald-50 via-white to-white text-emerald-600 ring-emerald-100",
  },
  {
    label: "Expenses",
    value: (_income: number, expenses: number) => formatCurrency(expenses, "USD"),
    accent: "from-rose-50 via-white to-white text-rose-600 ring-rose-100",
  },
  {
    label: "Net",
    value: (income: number, expenses: number) => formatCurrency(income - expenses, "USD"),
    accent: "from-zinc-50 via-white to-white text-zinc-900 ring-zinc-100",
  },
];

export const TransactionSummaryCards = ({ income, expenses }: TransactionSummaryCardsProps) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
    {cards.map(({ label, value, accent }) => (
      <div
        key={label}
        className={`rounded-3xl bg-gradient-to-br ${accent} p-5 ring-1 ring-inset`}
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold">
          {value(income, expenses)}
        </p>
      </div>
    ))}
  </div>
);
