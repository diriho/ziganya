import { useMemo, useState } from "react";
import { useTransactions } from "@sdk/requests";
import { CURRENT_USER_ID } from "@/lib/constants";
import { PageLoading, PageError } from "@/components/PageState";
import {
  TransactionFilters,
  TransactionRow,
  TransactionSummaryCards,
  type TypeFilter,
} from "@/components/Transactions";

export const TransactionsPage = () => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const { data: transactions = [], isLoading, error } = useTransactions(CURRENT_USER_ID);

  const { filtered, totals } = useMemo(() => {
    const filteredTx = transactions.filter((tx) => {
      const matchesType =
        typeFilter === "all" || tx.type?.toLowerCase() === typeFilter;
      return matchesType;
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
  }, [transactions, typeFilter]);

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message="Unable to fetch transactions." />;

  return (
    <section className="space-y-6" aria-labelledby="transactions-title">
      <header className="space-y-2">
        <h1 id="transactions-title" className="text-2xl font-semibold text-zinc-900">
          Transactions
        </h1>
        <p className="text-sm text-zinc-500">
          Review, search, and filter your latest activity.
        </p>
      </header>

      <TransactionSummaryCards
        income={totals.income}
        expenses={totals.expenses}
      />

      <TransactionFilters typeFilter={typeFilter} onFilterChange={setTypeFilter} />

      <div className="rounded-3xl bg-zinc-50/70 p-4 sm:p-6">
        <div
          className="overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          <div
            className="mb-2 grid min-w-[640px] grid-cols-5 gap-4 px-2 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-500"
            role="row"
          >
            <span>Date</span>
            <span>Merchant</span>
            <span>Category</span>
            <span>Source</span>
            <span className="text-right">Amount</span>
          </div>
          {filtered.length === 0 ? (
            <p className="min-w-[640px] px-4 py-10 text-center text-sm text-zinc-500">
              No transactions match your filters.
            </p>
          ) : (
            <ul className="space-y-2" role="list">
              {filtered.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};
