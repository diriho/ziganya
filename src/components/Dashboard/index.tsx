import { useState } from "react";
import { Sidebar } from "../Sidebar";
import { Header } from "./Header";
import { InfoCard } from "./InfoCard";
import { SpendingAnalytics } from "./SpendingAnalytics";
import { RecentActivities } from "./RecentActivities";
import {Budget} from "./Budget";
import { Subscriptions } from "./Subscriptions";
export const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-[#f0f2f0]">
            {/* Sidebar on the left */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Main content area - full width to scroll under sidebar */}
            <main className="flex-1 w-full">
                <div className={`p-3 sm:p-4 md:p-6 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'md:ml-64 lg:ml-72' : 'ml-0'
                }`}>
                    <Header isSidebarOpen={isSidebarOpen} />
                </div>

                {/* Horizontally scrollable InfoCards section - starts from left edge, scrolls under sidebar */}
                <div className="relative w-full">
                    {/* Cards container - scrolls horizontally from left edge, under sidebar */}
                    <div className="
                        flex gap-4 overflow-x-auto 
                        scrollbar-hide
                        pb-4
                        pl-0 pr-4 sm:pr-6
                    ">
                        <div className={`
                            flex gap-4 min-w-max
                            transition-all duration-300 ease-in-out
                            ${isSidebarOpen ? 'md:ml-64 lg:ml-72 md:pl-4' : 'ml-0 pl-4'}
                            sm:pl-6
                        `}>
                            <InfoCard
                                title="Total Balance"
                                value="$12,450.00"
                                trend="+12.5%"
                                trendUp={true}
                                accentColor="#063b1e"
                                className="min-w-[280px] sm:min-w-[300px] flex-shrink-0"
                            />
                            <InfoCard
                                title="Monthly Spending"
                                value="$2,140.50"
                                trend="-2.4%"
                                trendUp={false}
                                className="min-w-[280px] sm:min-w-[300px] flex-shrink-0"
                            />
                            <InfoCard
                                title="Active Subscriptions"
                                value="18"
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
                            {/* Add more cards here - they'll scroll horizontally */}
                        </div>
                    </div>
                </div>
                <div className={`p-3 sm:p-4 md:p-6 transition-all duration-300 ease-in-out ${
                    isSidebarOpen ? 'md:ml-64 lg:ml-72' : 'ml-0'
                }`}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                        {/* Left panel - takes 2 columns on large screens */}
                        <div className="lg:col-span-2">
                            <SpendingAnalytics />
                        </div>
                        
                        {/* Right panel - takes 1 column on large screens */}
                        <div className="lg:col-span-1">
                            <RecentActivities />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mt-4 sm:mt-5 md:mt-6">
                        <div className="lg:col-span-1">
                            <Budget />
                        </div>
                        <div className="lg:col-span-2">
                            <Subscriptions />
                        </div>
                    </div>
                </div>


            </main>
        </div>
    )
}