import { useMemo, useState } from "react";
import { CreditCard, Download, PiggyBank, Plus, Target, Wallet } from "lucide-react";
import { useAuth } from "@sdk/auth";
import { fetchAllTransactions } from "@sdk/requests";
import { Button, PageHeader, Segmented, Skeleton, useToast } from "@/components/ui";
import { PageError } from "@/components/PageState";
import { TransactionModal } from "@/components/Transactions";
import { monthlyKpis, subscriptionSummary, upcomingRenewals } from "@/lib/analytics";
import { resolveRange, startOfDay, startOfMonth, type RangePreset } from "@/lib/dates";
import { downloadTextFile, todayStamp, transactionsToCsv } from "@/lib/csv";
import { formatCurrency, formatPercent, formatShortDate } from "@/lib/format";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { StatTile } from "../StatTile";
import { SpendingAnalytics } from "../SpendingAnalytics";
import { CategoryBreakdown } from "../CategoryBreakdown";
import { BudgetCard } from "../BudgetCard";
import { RecentActivity } from "../RecentActivity";
import { UpcomingSubscriptions } from "../UpcomingSubscriptions";
import { useDashboardData } from "../useDashboardData";

function greeting(name: string, now = new Date()) {
  const h = now.getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return name ? `${part}, ${name}` : part;
}

export function DashboardHome() {
  const { user } = useAuth();
  const userId = user?.userID ?? "";
  const data = useDashboardData(userId);
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [exporting, setExporting] = useState(false);
  const [preset, setPreset] = useLocalStorage<RangePreset>("ziganya:analytics-range", "30d");
  const range = useMemo(() => resolveRange(preset), [preset]);

  const kpis = useMemo(() => monthlyKpis(data.transactions), [data.transactions]);
  const subs = useMemo(() => subscriptionSummary(data.subscriptions), [data.subscriptions]);
  const renewalsSoon = useMemo(() => upcomingRenewals(data.subscriptions, 7).length, [data.subscriptions]);
  const monthSpent = kpis.monthToDate.expense;

  const balance = Number(data.userRow?.total_balance ?? 0);
  const goal = Number(data.userRow?.savings_goal ?? 0);
  const goalPct = goal > 0 ? (balance / goal) * 100 : null;
  const netMonth = kpis.monthToDate.net;

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await fetchAllTransactions(userId);
      downloadTextFile(`ziganya-transactions-${todayStamp()}.csv`, transactionsToCsv(all, new Map(data.categories.map((c) => [c.id, c.name]))));
      toast.success("Export ready", `${all.length} transactions saved as CSV.`);
    } catch (err) {
      toast.error("Export failed", err instanceof Error ? err.message : undefined);
    } finally {
      setExporting(false);
    }
  };

  if (data.isError) {
    return <PageError message={data.error instanceof Error ? data.error.message : "We couldn't load your dashboard."} onRetry={data.refetch} />;
  }

  const today = startOfDay(new Date());
  const todayLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={todayLabel}
        title={greeting(user?.username ?? "")}
        description="Here's how your money is moving."
        actions={
          <>
            <Button variant="secondary" leftIcon={<Download size={16} />} onClick={exportCsv} loading={exporting}>
              Export CSV
            </Button>
            <Button leftIcon={<Plus size={16} />} onClick={() => setModalOpen(true)}>
              Add transaction
            </Button>
          </>
        }
      />

      {data.isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <section aria-label="Key figures" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              tone="brand"
              label="Total balance"
              value={formatCurrency(balance, data.currency)}
              icon={<Wallet size={18} />}
              delta={{
                text: formatCurrency(netMonth, data.currency, { signed: true, compact: Math.abs(netMonth) >= 10000 }),
                direction: netMonth > 0 ? "up" : netMonth < 0 ? "down" : "flat",
                positive: netMonth >= 0,
                hint: "net this month",
              }}
            />
            <StatTile
              label="Spent this month"
              value={formatCurrency(monthSpent, data.currency)}
              icon={<CreditCard size={18} />}
              spark={kpis.spark}
              delta={
                kpis.spendingChangePct === null
                  ? { text: "No prior data", direction: "flat", positive: true, hint: `since ${formatShortDate(startOfMonth(today))}` }
                  : {
                      text: formatPercent(kpis.spendingChangePct, Math.abs(kpis.spendingChangePct) < 10 ? 1 : 0),
                      direction: kpis.spendingChangePct > 0 ? "up" : kpis.spendingChangePct < 0 ? "down" : "flat",
                      positive: kpis.spendingChangePct <= 0,
                      hint: "vs same point last month",
                    }
              }
            />
            <StatTile
              label="Active subscriptions"
              value={String(subs.activeCount)}
              icon={<PiggyBank size={18} />}
              hint={
                subs.activeCount > 0
                  ? `${formatCurrency(subs.monthlyCost, data.currency)}/mo · ${renewalsSoon} renewing this week`
                  : "Nothing recurring tracked yet"
              }
            />
            <StatTile
              label="Savings goal"
              value={goal > 0 ? formatCurrency(goal, data.currency) : "Not set"}
              icon={<Target size={18} />}
              progress={goalPct}
              hint={
                goalPct !== null
                  ? `${Math.min(999, Math.round(goalPct))}% reached · ${formatCurrency(Math.max(0, goal - balance), data.currency)} to go`
                  : "Set a goal from Add transaction → Savings goal"
              }
            />
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">Spending</span>
              <Segmented<RangePreset>
                ariaLabel="Analytics period"
                value={preset}
                onChange={setPreset}
                options={[
                  { value: "7d", label: "7D" },
                  { value: "30d", label: "30D" },
                  { value: "3m", label: "3M" },
                ]}
              />
            </div>
            <p className="text-sm text-muted">
              {formatShortDate(range.from)} – {formatShortDate(range.to)}
            </p>
          </div>

          <section aria-label="Spending" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <SpendingAnalytics
                transactions={data.transactions}
                categories={data.categories}
                range={range}
                currency={data.currency}
                onAddTransaction={() => setModalOpen(true)}
              />
            </div>
            <CategoryBreakdown transactions={data.transactions} categories={data.categories} range={range} currency={data.currency} />
          </section>

          <section aria-label="Budget, renewals and activity" className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <BudgetCard userId={userId} budgets={data.budgets} monthSpent={monthSpent} currency={data.currency} />
            <UpcomingSubscriptions subscriptions={data.subscriptions} currency={data.currency} />
            <RecentActivity
              userId={userId}
              transactions={data.transactions}
              categories={data.categories}
              uploads={data.uploads}
              onScanFile={(file) => {
                setScanFile(file);
                setModalOpen(true);
              }}
            />
          </section>
        </>
      )}

      <TransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setScanFile(null);
        }}
        allowGoal
        initialFile={scanFile}
        defaultCurrency={data.currency}
      />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[148px] rounded-card" />
        ))}
      </div>
      <Skeleton className="h-9 w-56 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-[420px] rounded-card xl:col-span-2" />
        <Skeleton className="h-[420px] rounded-card" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[380px] rounded-card" />
        ))}
      </div>
    </div>
  );
}
