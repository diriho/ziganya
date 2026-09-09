import { CalendarDays, CreditCard, LayoutDashboard, Receipt, Settings, type LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/dashboard/transactions", label: "Transactions", icon: Receipt },
      { to: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
      { to: "/dashboard/subscriptions", label: "Subscriptions", icon: CreditCard },
    ],
  },
  {
    title: "Account",
    items: [{ to: "/dashboard/settings", label: "Settings", icon: Settings }],
  },
];

export function pageTitleFor(pathname: string): string {
  const all = NAV_SECTIONS.flatMap((s) => s.items);
  const exact = all.find((i) => i.to === pathname);
  if (exact) return exact.label;
  const prefix = all
    .filter((i) => !i.end && pathname.startsWith(`${i.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];
  return prefix?.label ?? "Dashboard";
}
