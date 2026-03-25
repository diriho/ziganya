import {
  LayoutDashboard,
  Receipt,
  Calendar,
  CreditCard,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";
import { AnimatedMenuIcon } from "./AnimatedMenuIcon";
import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import { SidebarSection } from './SidebarSection'
import { UpgradeCard } from "./UpgradeCard";


interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  activeItem?: string;
  onItemSelect?: (item: string) => void;
}

const defaultPath = "Dashboard";

const paths: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/transactions": "Transactions",
  "/dashboard/calendar": "Calendar",
  "/dashboard/subscriptions": "Subscriptions",
  "/dashboard/settings": "Settings",
  "/logout": "Logout",
};

const deriveActiveItem = (pathname: string) => {
  if (paths[pathname]) {
    return paths[pathname];
  }

  const match = Object.entries(paths).find(([path]) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  });

  return match?.[1] ?? defaultPath;
};


export const Sidebar = (props: SidebarProps = {}) => {
  const { 
      isOpen: externalIsOpen, 
      setIsOpen: externalSetIsOpen,
      activeItem: externalActiveItem,
      onItemSelect
  } = props;
  const location = useLocation();
  
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen ? (value: boolean) => externalSetIsOpen(value) : setInternalIsOpen;
  
  const derivedActiveItem = useMemo(() => deriveActiveItem(location.pathname), [location.pathname]);
  const activeItem = externalActiveItem !== undefined ? externalActiveItem : derivedActiveItem;

  const handleItemClick = (_sectionTitle: string, itemText: string) => {
    if (onItemSelect) {
        onItemSelect(itemText);
    }
  };



  const menuSections = useMemo(() => [
      {
          title: 'Menu',
          items: [
              { icon: <LayoutDashboard size={20} />, text: 'Dashboard', active: activeItem === 'Dashboard',location:"/dashboard" },
              { icon: <Receipt size={20} />, text: "Transactions", active: activeItem === 'Transactions',location: "/dashboard/transactions" },
              { icon: <Calendar size={20} />, text: 'Calendar', active: activeItem === 'Calendar',location:"/dashboard/calendar" },
              { icon: <CreditCard size={20} />, text: 'Subscriptions', active: activeItem === 'Subscriptions',location:"/dashboard/subscriptions" }
          ],
          hasActiveState: true
      },
      {
          title: 'General',
          items: [
              { icon: <Settings size={20} />, text: 'Settings', active: activeItem === 'Settings',location:"/dashboard/settings" },
              { icon: <LogOut size={20} />, text: 'Logout', active: activeItem === 'Logout',location:"/logout" }
          ],
          hasActiveState: false
      }
  ], [activeItem]);


  return (
    <>
        {/* Mobile backdrop overlay */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />
        )}
        
        <aside 
            className={`
                w-64 lg:w-72 bg-white border-r border-zinc-200 
                flex flex-col p-4 sm:p-6 fixed h-full z-50
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
        >
            {/* Logo Section with Toggle Button */}
            <div className="flex flex-row items-center justify-between gap-2 py-5">
                <div className="flex flex-row items-center gap-2">
                    <Sparkles size={20} />
                    <p className="text-[20px] font-bold text-[#063b1e] tracking-widest px-2 mb-2">
                        <Link to="/">Ziganya</Link>
                    </p>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-xl hover:bg-zinc-100 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:ring-offset-1"
                    aria-label="Close menu"
                >
                    <AnimatedMenuIcon isOpen size={20} className="text-zinc-600" />
                </button>
            </div>

            
            {menuSections.map((section, index) => (
                <SidebarSection
                    key={index}
                    title={section.title}
                    items={section.items}
                    hasActiveState={section.hasActiveState}
                    onItemClick={handleItemClick}
                />
            ))}
            
            {/* Spacer to push UpgradeCard to bottom */}
            <div className="flex-1" />
            
            <div className="mt-auto pb-2">
              <UpgradeCard/>
            </div>
            
        </aside>

        {/* Toggle button when sidebar is closed */}
        {!isOpen && (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-3.5 sm:top-4 left-3 sm:left-4 z-50 flex items-center justify-center bg-white border border-zinc-200 rounded-xl p-2.5 shadow-md hover:shadow-lg hover:bg-zinc-50 hover:border-zinc-300 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:ring-offset-1 text-brand-green w-10 h-10"
                aria-label="Open menu"
            >
                <AnimatedMenuIcon isOpen={false} size={20} className="text-brand-green" />
            </button>
        )}
    </>
  )
}
