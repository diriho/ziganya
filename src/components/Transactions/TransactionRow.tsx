import type { Transaction } from "@sdk/db";
import { formatCurrency, formatDate } from "@/lib/format";

interface TransactionRowProps {
  tx: Transaction;
}

export const TransactionRow = ({ tx }: TransactionRowProps) => {
  const isExpense = tx.type?.toLowerCase() === "expense";
  const displayAmount = tx.amount * (isExpense ? -1 : 1);

  return (
    <li
      className="grid min-w-[640px] grid-cols-5 gap-4 rounded-2xl bg-white/60 px-6 py-4 text-sm text-zinc-800 ring-1 ring-zinc-100"
      data-testid="transaction-row"
    >
      <span>{formatDate(tx.transaction_date)}</span>
      <span className="font-medium">{tx.merchant_name ?? "Unknown"}</span>
      <span className="text-zinc-500">—</span>
      <span className="capitalize text-zinc-500">{tx.source}</span>
      <span
        className={`text-right font-semibold ${
          isExpense ? "text-rose-600" : "text-emerald-600"
        }`}
      >
        {formatCurrency(displayAmount, tx.currency)}
      </span>
    </li>
  );
};
