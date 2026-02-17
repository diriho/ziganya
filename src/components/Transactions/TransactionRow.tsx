import type { Transaction } from "@sdk/db";
import { formatCurrency, formatDate } from "@/lib/format";

interface TransactionRowProps {
  transaction: Transaction;
  isSelected?: boolean;
}


export const TransactionRow = ({ transaction, isSelected }: TransactionRowProps) => {
  const isExpense = transaction.type?.toLowerCase() === "expense";
  const displayAmount = transaction.amount * (isExpense ? -1 : 1);
  const merchant = transaction.merchant_name ?? "Unknown";

  return (
    <tr
      data-testid="transaction-row"
      className={`
        border-b border-zinc-100 transition-colors last:border-b-0
        hover:bg-zinc-50/80
        ${isSelected ? "bg-brand-green-light/10" : ""}
      `}
    >
      <td className="whitespace-nowrap py-4 pl-6 pr-4 text-sm text-zinc-600">
        {formatDate(transaction.transaction_date)}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-zinc-900">{merchant}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-sm capitalize text-zinc-500">
        {transaction.source.split('_').join(" ") ?? "—"}
      </td>
      <td className="py-4 px-4">
        <span
          className={`
            inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium
            ${isExpense ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}
          `}
        >
          {isExpense ? "Expense" : "Income"}
        </span>
      </td>
      <td
        className={`py-4 pl-4 pr-6 text-right text-sm font-semibold tabular-nums ${
          isExpense ? "text-rose-600" : "text-emerald-600"
        }`}
      >
        {formatCurrency(displayAmount, transaction.currency)}
      </td>
    </tr>
  );
};
