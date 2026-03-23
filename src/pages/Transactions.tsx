import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useCurrentUser, useTransactions } from "@sdk/requests";
import { PageLoading, PageError } from "@/components/PageState";
import {
  TransactionChart,
  TransactionFilters,
  TransactionRow,
  TransactionSummaryCards,
  type TypeFilter,
} from "@/components/Transactions";

export const TransactionsPage = () => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isLoading: userLoading } = useCurrentUser();

  const { data: transactions = [], isLoading, error } = useTransactions(user?.userID ?? "");

  const { filtered, totals } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filteredTx = transactions.filter((tx) => {
      const matchesType =
        typeFilter === "all" || tx.type?.toLowerCase() === typeFilter;
      const matchesSearch =
        !q ||
        (tx.merchant_name?.toLowerCase().includes(q)) ||
        String(tx.amount).includes(q);
      return matchesType && matchesSearch;
    });

    const income = filteredTx
      .filter((tx) => tx.type?.toLowerCase() === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = filteredTx
      .filter((tx) => tx.type?.toLowerCase() === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      filtered: filteredTx,
      totals: { income, expenses },
    };
  }, [transactions, typeFilter, searchQuery]);

  if (userLoading || isLoading) return <PageLoading />;
  if (error) return <PageError message="Unable to fetch transactions." />;

  return (
    <section className="space-y-8" aria-labelledby="transactions-title">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            id="transactions-title"
            className="text-2xl font-bold tracking-tight text-zinc-900"
          >
            My Transactions
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track and manage all your transactions.
          </p>
        </div>
        <button
          type="button"
          className="mt-4 flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 sm:mt-0"
          aria-label="Add transaction"
        >
          <Plus size={18} aria-hidden />
          <span>Add Transaction</span>
        </button>
      </header>

      <TransactionSummaryCards
        income={totals.income}
        expenses={totals.expenses}
      />

      <TransactionChart transactions={filtered} />

      <TransactionFilters
        typeFilter={typeFilter}
        onFilterChange={setTypeFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/50">
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Date
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Merchant
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Source
                </th>
                <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-4 py-3.5 pr-6 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-sm text-zinc-500"
                  >
                    No transactions match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3 text-sm text-zinc-500">
            <span>
              Showing <strong className="font-medium text-zinc-700">{filtered.length}</strong> of{" "}
              <strong className="font-medium text-zinc-700">{transactions.length}</strong> transactions
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
