import { useState } from "react";
import { useSubscriptions, useTransactions } from "@sdk/requests";
import { Sidebar } from "@components/Sidebar";
import {
  Header,
  InfoCard,
  SpendingAnalytics,
  RecentActivities,
  Budget,
  Subscriptions,
} from "@components/Dashboard";

export const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const userId = import.meta.env.VITE_TEST_USER;
  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions(userId);
  const { data: transactions, isLoading: txLoading } = useTransactions(userId, 10);

  const totalSpending =
    transactions?.reduce((sum: number, transaction: { amount: number }) => sum + transaction.amount, 0) ?? 0;
  const subscriptionCount = subscriptions?.length ?? 0;

  if (subsLoading || txLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#f0f2f0]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="flex-1 w-full">
        <div
          className={`p-3 sm:p-4 md:p-6 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "md:ml-64 lg:ml-72" : "ml-0"
          }`}
        >
          <Header isSidebarOpen={isSidebarOpen} />
        </div>

        <div className="relative w-full">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 pl-0 pr-4 sm:pr-6">
            <div
              className={`
                flex gap-4 min-w-max
                transition-all duration-300 ease-in-out
                ${isSidebarOpen ? "md:ml-64 lg:ml-72 md:pl-4" : "ml-0 pl-4"}
                sm:pl-6
              `}
            >
              <InfoCard
                title="Total Balance"
                value="$20,000"
                trend="+12.5%"
                trendUp={true}
                accentColor="#063b1e"
                className="min-w-[280px] sm:min-w-[300px] flex-shrink-0"
              />
              <InfoCard
                title="Monthly Spending"
                value={`${totalSpending.toFixed(2)}`}
                trend="-2.4%"
                trendUp={false}
                className="min-w-[280px] sm:min-w-[300px] flex-shrink-0"
              />
              <InfoCard
                title="Active Subscriptions"
                value={String(subscriptionCount)}
                trend="+1 this month"
                trendUp={true}
                className="min-w-[280px] sm:min-w-[300px] flex-shrink-0"
              />
              <InfoCard
                title="Savings Goal"
                value="$45,000"
                trend="74% reached"
                trendUp={true}
                className="min-w-[280px] sm:min-w-[300px] flex-shrink-0"
              />
            </div>
          </div>
        </div>

        <div
          className={`p-3 sm:p-4 md:p-6 transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "md:ml-64 lg:ml-72" : "ml-0"
          }`}
        >
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
              <Subscriptions subs={subscriptions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
