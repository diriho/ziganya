import { Link, NavLink, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useAuth } from "@sdk/auth";
import { Avatar, cn } from "@/components/ui";
import { LogoMark, Wordmark } from "@/components/Logo";
import { NAV_SECTIONS, type NavItem } from "./navItems";

export interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

function SidebarLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          "group relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
          isActive ? "text-primary-fg" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
          collapsed && "md:justify-center md:px-0"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active-pill"
              className="absolute inset-0 rounded-xl bg-primary shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 40 }}
            />
          )}
          <Icon size={19} className="relative z-10 shrink-0" aria-hidden />
          <span className={cn("relative z-10 truncate", collapsed && "md:hidden")}>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({ mobileOpen, onCloseMobile, collapsed, onToggleCollapsed }: SidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#06110a]/50 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onCloseMobile}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-line bg-surface",
          "transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          collapsed ? "md:w-[76px]" : "md:w-[272px]"
        )}
        aria-label="Primary"
      >
        <div className={cn("flex h-16 shrink-0 items-center justify-between px-4", collapsed && "md:justify-center md:px-0")}>
          <Link to="/" className="flex items-center gap-2.5 rounded-lg" aria-label="Ziganya home">
            <LogoMark size={34} />
            <Wordmark className={cn(collapsed && "md:hidden")} />
          </Link>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-2 scrollbar-hide" aria-label="Sections">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-5">
              <p className={cn("eyebrow mb-2 px-3", collapsed && "md:sr-only")}>{section.title}</p>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.to}>
                    <SidebarLink item={item} collapsed={collapsed} onNavigate={onCloseMobile} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-line p-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-2.5",
              collapsed && "md:justify-center md:border-transparent md:bg-transparent md:p-0"
            )}
          >
            <Avatar name={user?.fullName || user?.username} src={user?.avatarUrl} size="sm" />
            <div className={cn("min-w-0 flex-1", collapsed && "md:hidden")}>
              <p className="truncate text-sm font-semibold text-ink">{user?.fullName || user?.username || "Account"}</p>
              <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/logout")}
              className={cn("rounded-lg p-2 text-muted transition-colors hover:bg-surface-3 hover:text-danger", collapsed && "md:hidden")}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleCollapsed}
            className={cn(
              "mt-2 hidden h-9 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink md:flex"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            <span className={cn(collapsed && "md:hidden")}>Collapse</span>
          </button>
        </div>
      </aside>
    </>
  );
}
