import { useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "@components/Sidebar";
import { Header } from "@components/Dashboard";


export const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-[#f0f2f0]">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex-1 w-full">
                <div
                    className={`p-3 sm:p-4 md:p-6 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64 lg:ml-72" : "ml-0"
                        }`}
                >
                    <Header isSidebarOpen={isSidebarOpen} />
                </div>
                <div
                    className={`p-3 sm:p-4 md:p-6 transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:ml-64 lg:ml-72" : "ml-0"
                        }`}
                >
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
