import type { CalendarActivity } from "./types";

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function toDateKey(value: Date): string {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -date.getDay());
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function groupActivitiesByDate(activities: CalendarActivity[]) {
  const groups = new Map<string, CalendarActivity[]>();
  for (const item of activities) {
    if (!groups.has(item.dateKey)) groups.set(item.dateKey, []);
    groups.get(item.dateKey)?.push(item);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}
