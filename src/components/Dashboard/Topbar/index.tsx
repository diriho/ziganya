import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { Bell, CalendarClock, LogOut, Menu, Moon, PiggyBank, Receipt, Search, Settings, Sun } from "lucide-react";
import { useAuth } from "@sdk/auth";
import { useTheme } from "@/providers/theme";
import { Avatar, Dropdown, DropdownItem, cn } from "@/components/ui";
import { pageTitleFor } from "@/components/Sidebar/navItems";
import { useNotifications, type NotificationKind } from "../useNotifications";

const kindIcon: Record<NotificationKind, typeof Bell> = {
  renewal: CalendarClock,
  budget: PiggyBank,
  upload: Receipt,
};

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user } = useAuth();
  const { resolved, toggle } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const notifications = useNotifications(user?.userID ?? "");

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/dashboard/transactions?q=${encodeURIComponent(q)}` : "/dashboard/transactions");
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="rounded-xl border border-line bg-surface p-2 text-ink-2 shadow-sm hover:bg-surface-2 md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>

        <h1 className="mr-2 hidden font-display text-base font-bold sm:block">{pageTitleFor(pathname)}</h1>

        <form onSubmit={submitSearch} role="search" className="relative ml-auto hidden w-full max-w-md sm:block">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions…"
            aria-label="Search transactions"
            className="field h-10 pl-10 pr-14"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
            Enter
          </kbd>
        </form>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <Dropdown
            width="w-[22rem]"
            trigger={({ toggle: open }) => (
              <button
                type="button"
                onClick={open}
                className="relative rounded-xl border border-line bg-surface p-2.5 text-ink-2 shadow-sm transition-colors hover:bg-surface-2 hover:text-ink"
                aria-label={`Notifications${notifications.unreadCount ? `, ${notifications.unreadCount} unread` : ""}`}
              >
                <Bell size={18} />
                {notifications.unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-bg">
                    {notifications.unreadCount > 9 ? "9+" : notifications.unreadCount}
                  </span>
                )}
              </button>
            )}
          >
            {(close) => (
              <div>
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <p className="text-sm font-bold">Notifications</p>
                  {notifications.items.length > 0 && (
                    <button type="button" onClick={notifications.markAllRead} className="text-xs font-semibold text-brand hover:underline">
                      Mark all read
                    </button>
                  )}
                </div>
                {notifications.items.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted">You're all caught up.</p>
                ) : (
                  <ul className="max-h-[60vh] overflow-y-auto scrollbar-thin">
                    {notifications.items.map((n) => {
                      const Icon = kindIcon[n.kind];
                      const read = notifications.isRead(n.id);
                      return (
                        <li key={n.id}>
                          <button
                            type="button"
                            onClick={() => {
                              notifications.markRead(n.id);
                              close();
                              navigate(n.href);
                            }}
                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
                          >
                            <span
                              className={cn(
                                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                n.tone === "danger" && "bg-danger-soft text-danger",
                                n.tone === "warn" && "bg-warn-soft text-warn",
                                n.tone === "info" && "bg-info-soft text-info",
                                n.tone === "neutral" && "bg-brand-soft text-brand"
                              )}
                            >
                              <Icon size={15} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className={cn("block truncate text-sm", read ? "font-medium text-ink-2" : "font-semibold text-ink")}>{n.title}</span>
                              <span className="block truncate text-xs text-muted">{n.description}</span>
                            </span>
                            {!read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent ring-2 ring-brand/20" aria-hidden />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}
          </Dropdown>

          <button
            type="button"
            onClick={toggle}
            className="hidden rounded-xl border border-line bg-surface p-2.5 text-ink-2 shadow-sm transition-colors hover:bg-surface-2 hover:text-ink sm:block"
            aria-label={resolved === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {resolved === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Dropdown
            width="w-64"
            trigger={({ toggle: open }) => (
              <button type="button" onClick={open} className="flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-surface-2" aria-label="Account menu">
                <Avatar name={user?.fullName || user?.username} src={user?.avatarUrl} size="sm" />
              </button>
            )}
          >
            {(close) => (
              <div>
                <div className="flex items-center gap-3 border-b border-line px-4 py-3">
                  <Avatar name={user?.fullName || user?.username} src={user?.avatarUrl} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user?.fullName || user?.username}</p>
                    <p className="truncate text-xs text-muted">{user?.email}</p>
                  </div>
                </div>
                <div className="py-1">
                  <DropdownItem icon={<Settings size={16} />} onClick={() => { close(); navigate("/dashboard/settings"); }}>
                    Settings
                  </DropdownItem>
                  <DropdownItem icon={resolved === "dark" ? <Sun size={16} /> : <Moon size={16} />} onClick={toggle}>
                    {resolved === "dark" ? "Light mode" : "Dark mode"}
                  </DropdownItem>
                  <DropdownItem icon={<LogOut size={16} />} tone="danger" onClick={() => { close(); navigate("/logout"); }}>
                    Sign out
                  </DropdownItem>
                </div>
              </div>
            )}
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
