import { useSubscriptions, useTransactions } from "@sdk/requests";
import { useCurrentUser } from "@sdk/requests";
import { useUser } from "@sdk/requests";
import {
  InfoCard,
  SpendingAnalytics,
  RecentActivities,
  Budget,
  Subscriptions,
} from "@components/Dashboard";
import { formatCurrency } from "@/lib/format";


/** Content only: for use inside DashboardLayout (Outlet). */
export const DashboardHome = () => {
  const { user, isLoading: userLoading } = useCurrentUser();
  const { data: userRow, isLoading: userRowLoading } = useUser(user?.userID ?? "");
  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions(user?.userID ?? "");
  const { data: transactions, isLoading: txLoading } = useTransactions(user?.userID ?? "", 10);
  const summarySubscriptions = subscriptions?.slice(0, 5) ?? [];

  const totalBalance = Number(userRow?.total_balance ?? 0);
  const savingsGoal = Number(userRow?.savings_goal ?? 0);
  const totalSpending =
    transactions?.reduce((sum: number, t: { amount: number }) => sum + t.amount, 0) ?? 0;
  const subscriptionCount = subscriptions?.length ?? 0;

  if (userLoading || userRowLoading || subsLoading || txLoading) return <div>Loading...</div>;

  return (
    <>
      <div className="relative w-full">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pl-0 pr-4 sm:pr-6">
          <div className="flex gap-4 min-w-max pl-4 sm:pl-6">
            <InfoCard
              title="Total Balance"
              value={formatCurrency(totalBalance)}
              trend="+12.5%"
              trendUp={true}
              accentColor="#063b1e"
              className="min-w-70 sm:min-w-75 shrink-0"
            />
            <InfoCard
              title="Monthly Spending"
              value={`${totalSpending.toFixed(2)}`}
              trend="-2.4%"
              trendUp={false}
              className="min-w-70 sm:min-w-75 shrink-0"
            />
            <InfoCard
              title="Active Subscriptions"
              value={String(subscriptionCount)}
              trend="+1 this month"
              trendUp={true}
              className="min-w-70 sm:min-w-75 shrink-0"
            />
            <InfoCard
              title="Savings Goal"
              value={formatCurrency(savingsGoal)}
              trend="74% reached"
              trendUp={true}
              className="min-w-70 sm:min-w-75 shrink-0"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <div className="lg:col-span-2">
          <SpendingAnalytics />
        </div>
        <div className="lg:col-span-1">
          <RecentActivities />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-4 sm:mt-5 md:mt-6">
        <div className="lg:col-span-1">
          <Budget />
        </div>
        <div className="lg:col-span-2">
          <Subscriptions subs={summarySubscriptions} />
        </div>
      </div>
    </>
  );
};
