import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { Download, Plus, TrendingUp } from "lucide-react";
import type { Transaction } from "@sdk/db";
import { useAuth } from "@sdk/auth";
import { useCategories, useDeleteTransaction, useTransactions } from "@sdk/requests";
import { Button, Card, CardHeader, ConfirmDialog, PageHeader, Segmented, useToast } from "@/components/ui";
import { PageError, PageLoading } from "@/components/PageState";
import { CashflowChart, ChartTable } from "@/components/charts";
import { StatTile } from "@/components/Dashboard/StatTile";
import { dominantCurrency } from "@/components/Dashboard/useDashboardData";
import { TransactionFilters, TransactionModal, TransactionsTable, type DatePreset, type TypeFilter } from "@/components/Transactions";
import { bucketTransactions, filterByRange, isIncome, totalsOf, txDateKey, type Bucket } from "@/lib/analytics";
import { addDays, autoWindow, startOfDay, startOfMonth } from "@/lib/dates";
import { downloadTextFile, todayStamp, transactionsToCsv } from "@/lib/csv";
import { formatCurrency } from "@/lib/format";

const PAGE_SIZE = 25;

export function TransactionsPage() {
  const { user } = useAuth();
  const userId = user?.userID ?? "";
  const [params, setParams] = useSearchParams();
  const toast = useToast();

  const { data: transactions = [], isLoading, error, refetch } = useTransactions(userId, 5000);
  const { data: categories = [] } = useCategories(userId);
  const remove = useDeleteTransaction(userId);

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [chartView, setChartView] = useState<"chart" | "table">("chart");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const query = params.get("q") ?? "";
  const setQuery = (q: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (q) next.set("q", q);
        else next.delete("q");
        return next;
      },
      { replace: true }
    );
    setPage(1);
  };
  const withReset = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };

  const currency = useMemo(() => dominantCurrency(transactions), [transactions]);

  const filtered = useMemo(() => {
    const today = startOfDay(new Date());
    let rows = transactions;
    if (datePreset !== "all") {
      const from = datePreset === "month" ? startOfMonth(today) : addDays(today, datePreset === "30d" ? -29 : -89);
      rows = filterByRange(rows, from, today);
    }
    if (typeFilter !== "all") rows = rows.filter((t) => (typeFilter === "income" ? isIncome(t) : !isIncome(t)));
    if (categoryId === "__none") rows = rows.filter((t) => !t.category_id);
    else if (categoryId) rows = rows.filter((t) => t.category_id === categoryId);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          t.merchant_name?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          String(t.amount).includes(q) ||
          t.source?.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [transactions, datePreset, typeFilter, categoryId, query]);

  const totals = useMemo(() => totalsOf(filtered), [filtered]);
  const buckets = useMemo(() => {
    const win = autoWindow(filtered.map((t) => txDateKey(t) ?? "").filter(Boolean));
    return win ? bucketTransactions(filtered, win) : [];
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const hasFilters = typeFilter !== "all" || datePreset !== "all" || !!categoryId || !!query;

  const exportCsv = () => {
    downloadTextFile(`ziganya-transactions-${todayStamp()}.csv`, transactionsToCsv(filtered, new Map(categories.map((c) => [c.id, c.name]))));
    toast.success("Export ready", `${filtered.length} transactions saved as CSV.`);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success("Transaction deleted");
      setDeleting(null);
    } catch (err) {
      toast.error("Could not delete", err instanceof Error ? err.message : undefined);
    }
  };

  if (isLoading) return <PageLoading />;
  if (error) return <PageError message="We couldn't load your transactions." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ledger"
        title="Transactions"
        description="Every expense and income, searchable and exportable."
        actions={
          <>
            <Button variant="secondary" leftIcon={<Download size={16} />} onClick={exportCsv} disabled={filtered.length === 0}>
              Export CSV
            </Button>
            <Button leftIcon={<Plus size={16} />} onClick={() => setCreating(true)}>
              Add transaction
            </Button>
          </>
        }
      />

      <section aria-label="Totals for the current filters" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Income" value={formatCurrency(totals.income, currency)} hint={`${filtered.filter(isIncome).length} entries`} className="min-h-[120px]" />
        <StatTile label="Expenses" value={formatCurrency(totals.expense, currency)} hint={`${filtered.length - filtered.filter(isIncome).length} entries`} className="min-h-[120px]" />
        <StatTile
          label="Net"
          value={formatCurrency(totals.net, currency, { signed: true })}
          delta={{ text: totals.net >= 0 ? "Positive cash flow" : "Spending exceeds income", direction: totals.net > 0 ? "up" : totals.net < 0 ? "down" : "flat", positive: totals.net >= 0 }}
          className="min-h-[120px]"
        />
      </section>

      <TransactionFilters
        typeFilter={typeFilter}
        onTypeChange={withReset(setTypeFilter)}
        datePreset={datePreset}
        onDateChange={withReset(setDatePreset)}
        searchQuery={query}
        onSearchChange={setQuery}
        categoryId={categoryId}
        onCategoryChange={withReset(setCategoryId)}
        categories={categories}
      />

      {buckets.length > 1 && (
        <Card padding="md">
          <CardHeader
            title="Cash flow"
            subtitle="Income and expenses over the filtered period"
            action={
              <Segmented<"chart" | "table">
                size="sm"
                ariaLabel="Cash flow view"
                value={chartView}
                onChange={setChartView}
                options={[
                  { value: "chart", label: "Chart", icon: <TrendingUp size={14} /> },
                  { value: "table", label: "Table" },
                ]}
              />
            }
          />
          {chartView === "chart" ? (
            <CashflowChart data={buckets} currency={currency} height={250} />
          ) : (
            <ChartTable<Bucket>
              caption="Income and expenses by period"
              rows={buckets}
              rowKey={(b) => b.key}
              columns={[
                { key: "period", label: "Period", render: (b) => b.longLabel },
                { key: "income", label: "Income", align: "right", render: (b) => formatCurrency(b.income, currency) },
                { key: "expense", label: "Expenses", align: "right", render: (b) => formatCurrency(b.expense, currency) },
                { key: "count", label: "Transactions", align: "right", render: (b) => b.count },
              ]}
            />
          )}
        </Card>
      )}

      <TransactionsTable
        rows={pageRows}
        total={filtered.length}
        categories={categories}
        page={safePage}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onEdit={setEditing}
        onDelete={setDeleting}
        hasFilters={hasFilters}
        emptyAction={
          !hasFilters && (
            <Button leftIcon={<Plus size={16} />} onClick={() => setCreating(true)}>
              Add transaction
            </Button>
          )
        }
      />

      <TransactionModal open={creating} onClose={() => setCreating(false)} defaultCurrency={currency} />
      <TransactionModal open={!!editing} onClose={() => setEditing(null)} transaction={editing} defaultCurrency={currency} />
      <ConfirmDialog
        open={!!deleting}
        tone="danger"
        title="Delete this transaction?"
        description={deleting ? `${deleting.merchant_name ?? "This entry"} for ${formatCurrency(deleting.amount, deleting.currency || currency)} will be removed permanently.` : undefined}
        confirmLabel="Delete"
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
