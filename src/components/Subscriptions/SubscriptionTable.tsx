import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Subscription } from "@sdk/db";
import { Badge, Dropdown, DropdownItem, cn, type BadgeTone } from "@/components/ui";
import { monthlyCostOf } from "@/lib/analytics";
import { dateKeyOf, parseDateKey, startOfDay } from "@/lib/dates";
import { formatCurrency, formatDate, formatRelativeDay, initialsOf, titleCase } from "@/lib/format";
import { isOverdue } from "./utils";

function statusTone(status: string | null): BadgeTone {
  const s = (status ?? "").toLowerCase();
  if (s === "active" || s === "trial" || s === "trialing") return "good";
  if (s === "paused") return "warn";
  if (s === "cancelled" || s === "canceled") return "neutral";
  return "info";
}

export interface SubscriptionTableProps {
  title: string;
  subtitle?: string;
  subscriptions: Subscription[];
  currency: string;
  onEdit: (sub: Subscription) => void;
  onDelete: (sub: Subscription) => void;
}

export function SubscriptionTable({ title, subtitle, subscriptions, currency, onEdit, onDelete }: SubscriptionTableProps) {
  return (
    <section className="card overflow-hidden" aria-label={title}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
        <Badge tone="neutral">{subscriptions.length}</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-surface-2/60">
              <Th className="pl-6">Name</Th>
              <Th>Cycle</Th>
              <Th>Next billing</Th>
              <Th>Status</Th>
              <Th className="text-right">Amount</Th>
              <Th className="text-right">Per month</Th>
              <Th className="w-14 pr-4">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const overdue = isOverdue(sub);
              const key = dateKeyOf(sub.next_billing_date);
              const daysAway = key ? Math.round((parseDateKey(key).getTime() - startOfDay(new Date()).getTime()) / 86_400_000) : null;
              const showRelative = daysAway !== null && daysAway >= 0 && daysAway <= 14;
              return (
                <tr key={sub.id} className="group border-b border-line transition-colors last:border-b-0 hover:bg-surface-2/60">
                  <td className="py-3.5 pl-6 pr-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-xs font-bold text-accent dark:bg-brand-soft dark:text-brand">
                        {initialsOf(sub.name, "S").slice(0, 1)}
                      </span>
                      <span className="truncate text-sm font-semibold text-ink">{sub.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-sm text-ink-2">{titleCase(sub.billing_cycle) || "Monthly"}</td>
                  <td className="whitespace-nowrap py-3.5 pr-4 text-sm">
                    <span className="text-ink-2">{formatDate(sub.next_billing_date)}</span>
                    {sub.next_billing_date && (overdue || showRelative) && (
                      <span className={cn("ml-2 text-xs", overdue ? "font-semibold text-warn" : "text-muted")}>
                        {overdue ? "date passed" : formatRelativeDay(sub.next_billing_date).toLowerCase()}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 pr-4">
                    <Badge tone={statusTone(sub.status)} size="sm" dot>
                      {sub.status ?? "active"}
                    </Badge>
                  </td>
                  <td className="tabular whitespace-nowrap py-3.5 pr-4 text-right text-sm font-semibold text-ink">{formatCurrency(sub.amount, sub.currency || currency)}</td>
                  <td className="tabular whitespace-nowrap py-3.5 pr-4 text-right text-sm text-ink-2">{formatCurrency(monthlyCostOf(sub), sub.currency || currency)}</td>
                  <td className="py-3.5 pr-4 text-right">
                    <Dropdown
                      width="w-44"
                      trigger={({ toggle }) => (
                        <button type="button" onClick={toggle} className="rounded-lg p-2 text-muted opacity-70 transition-opacity hover:bg-surface-3 hover:text-ink group-hover:opacity-100" aria-label={`Actions for ${sub.name}`}>
                          <MoreHorizontal size={16} />
                        </button>
                      )}
                    >
                      {(close) => (
                        <div className="py-1">
                          <DropdownItem icon={<Pencil size={15} />} onClick={() => { close(); onEdit(sub); }}>
                            Edit
                          </DropdownItem>
                          <DropdownItem icon={<Trash2 size={15} />} tone="danger" onClick={() => { close(); onDelete(sub); }}>
                            Delete
                          </DropdownItem>
                        </div>
                      )}
                    </Dropdown>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted", className)}>{children}</th>;
}
