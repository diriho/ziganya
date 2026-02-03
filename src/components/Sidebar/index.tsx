import {
  LayoutDashboard,
  Receipt,
  Calendar,
  CreditCard,
  Sparkles,
  Settings,
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useState, useMemo } from "react";
import {SidebarSection} from './SidebarSection'
import { UpgradeCard } from "./UpgradeCard";


interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export const Sidebar = (props: SidebarProps = {}) => {
  const { isOpen: externalIsOpen, setIsOpen: externalSetIsOpen } = props;
  const [internalIsOpen, setInternalIsOpen] = useState(true);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen ? (value: boolean) => externalSetIsOpen(value) : setInternalIsOpen;
  const [activeItem, setActiveItem] = useState<{ section: string; item: string }>({
    section: 'Menu',
    item: 'Dashboard'
  });

  const menuSections = useMemo(() => [
      {
          title: 'Menu',
          items: [
              { icon: <LayoutDashboard size={20} />, text: 'Dashboard', active: activeItem.section === 'Menu' && activeItem.item === 'Dashboard',location:"/" },
              { icon: <Receipt size={20} />, text: "Transactions", active: activeItem.section === 'Menu' && activeItem.item === 'Transactions',location: "/transactions" },
              { icon: <Calendar size={20} />, text: 'Calendar', active: activeItem.section === 'Menu' && activeItem.item === 'Calendar',location:"/calendar" },
              { icon: <CreditCard size={20} />, text: 'Subscriptions', active: activeItem.section === 'Menu' && activeItem.item === 'Subscriptions',location:"/subscriptions" }
          ],
          hasActiveState: true
      },
      {
          title: 'General',
          items: [
              { icon: <Settings size={20} />, text: 'Settings', active: activeItem.section === 'General' && activeItem.item === 'Settings',location:"/settings" },
              { icon: <LogOut size={20} />, text: 'Logout', active: activeItem.section === 'General' && activeItem.item === 'Logout',location:"/logout" }
          ],
          hasActiveState: false
      }
  ], [activeItem]);

  const handleItemClick = (sectionTitle: string, itemText: string) => {
    setActiveItem({ section: sectionTitle, item: itemText });
  };


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
                        Ziganya
                    </p>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="
                        p-1.5 rounded-lg
                        hover:bg-zinc-100
                        transition-colors duration-200
                    "
                >
                    <X size={18} className="text-zinc-600" />
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
                className="
                    fixed top-3.5 sm:top-4 left-3 sm:left-4 z-50
                    bg-white border border-zinc-200 rounded-xl p-2.5
                    shadow-md hover:shadow-lg
                    hover:bg-zinc-50 hover:border-zinc-300
                    transition-all duration-200
                    text-brand-green
                "
                aria-label="Open menu"
            >
                <Menu size={20} />
            </button>
        )}
    </>
  )
}
