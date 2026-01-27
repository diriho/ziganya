import { Bell, CircleUser, Plus, Download } from "lucide-react"
import { SearchInput } from "../SearchInput"

interface HeaderProps {
    isSidebarOpen?: boolean;
}

export const Header = ({ isSidebarOpen = true }: HeaderProps) => {
    const user = {
        username: 'Tharcisse',
        email: 'tharcisse@gmail.com'
    }
    return (
        <div>
            {/* Top bar - search, notifications, user */}
            <div className={`
                flex items-center gap-2 sm:gap-4 w-full
                transition-all duration-300
                ${!isSidebarOpen ? 'pl-12 sm:pl-14' : ''}
            `}>
                {/* Search - takes available space */}
                <div className="flex-1 min-w-0">
                    <SearchInput />
                </div>
                
                {/* Right side actions */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {/* Notification button */}
                    <button
                        className="
                            relative p-2 sm:p-2.5 rounded-xl bg-white border border-zinc-200
                            text-brand-green hover:text-brand-green
                            hover:bg-zinc-50 hover:border-zinc-300
                            transition-all duration-200
                            shadow-sm hover:shadow-md
                        "
                        aria-label="Notifications"
                    >
                        <Bell size={18} />
                        <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User info - hidden on mobile */}
                    <div className="hidden md:flex flex-col items-end">
                        <p className="text-sm font-medium text-brand-green">{user.username}</p>
                        <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                    
                    {/* User avatar */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-green-light flex items-center justify-center border border-zinc-200 shadow-sm flex-shrink-0">  
                        <CircleUser size={24} className="text-brand-green" />
                    </div>
                </div>
            </div>

            {/* Welcome section with action buttons */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4 sm:mt-5">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-brand-green mb-1 sm:mb-2 tracking-tight">Dashboard</h1>
                    <p className="text-xs sm:text-sm text-zinc-500">Welcome back, {user.username}. Your finances are looking good!</p>
                </div>
                
                {/* Action buttons - stack on mobile */}
                <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
                    <button className="bg-brand-green text-brand-green-light px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base font-medium hover:opacity-90 transition-opacity">
                        <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>Add Transaction</span>
                    </button>
                    <button className="bg-white text-brand-green border border-zinc-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base font-medium hover:bg-zinc-50 transition-colors">
                        <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span>Export Data</span>
                    </button>
                </div>
            </div>
        </div>
    );
}