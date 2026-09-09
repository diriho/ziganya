import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Receipt, Trash2 } from "lucide-react";
import type { Category, Transaction } from "@sdk/db";
import { Badge, Button, Dropdown, DropdownItem, EmptyState, cn } from "@/components/ui";
import { isExpense } from "@/lib/analytics";
import { formatDate, formatSignedAmount } from "@/lib/format";
import { sourceMeta } from "@/lib/sources";

export interface TransactionsTableProps {
  rows: Transaction[];
  total: number;
  categories: Category[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  emptyAction?: React.ReactNode;
  hasFilters?: boolean;
}

export function TransactionsTable({ rows, total, categories, page, pageSize, onPageChange, onEdit, onDelete, emptyAction, hasFilters }: TransactionsTableProps) {
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  return (
    <div className="card overflow-hidden">
      {rows.length === 0 ? (
        <EmptyState
          icon={<Receipt size={22} />}
          title={hasFilters ? "No transactions match these filters" : "No transactions yet"}
          description={hasFilters ? "Try widening the date range or clearing the search." : "Add your first transaction to start tracking."}
          action={emptyAction}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-surface-2/60">
                  <Th className="pl-6">Date</Th>
                  <Th>Merchant</Th>
                  <Th>Category</Th>
                  <Th>Source</Th>
                  <Th className="text-right">Amount</Th>
                  <Th className="w-14 pr-4">
                    <span className="sr-only">Actions</span>
                  </Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((tx) => {
                  const expense = isExpense(tx);
                  const src = sourceMeta(tx.source);
                  const title = tx.merchant_name || tx.description || (expense ? "Expense" : "Income");
                  return (
                    <tr key={tx.id} className="group border-b border-line transition-colors last:border-b-0 hover:bg-surface-2/60">
                      <td className="tabular whitespace-nowrap py-3.5 pl-6 pr-4 text-sm text-ink-2">{formatDate(tx.transaction_date)}</td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-2" title={src.label}>
                            <src.Icon size={15} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">{title}</p>
                            {tx.description && tx.merchant_name && <p className="truncate text-xs text-muted">{tx.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        {tx.category_id ? (
                          <Badge tone="brand" size="sm">
                            {categoryName.get(tx.category_id) ?? "Unknown"}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-sm text-ink-2">{src.label}</td>
                      <td className={cn("tabular whitespace-nowrap py-3.5 pr-4 text-right text-sm font-semibold", expense ? "text-ink" : "text-good")}>
                        {formatSignedAmount(tx.amount, expense, tx.currency || "USD")}
                      </td>
                      <td className="py-3.5 pr-4 text-right">
                        <Dropdown
                          width="w-44"
                          trigger={({ toggle }) => (
                            <button type="button" onClick={toggle} className="rounded-lg p-2 text-muted opacity-70 transition-opacity hover:bg-surface-3 hover:text-ink group-hover:opacity-100" aria-label={`Actions for ${title}`}>
                              <MoreHorizontal size={16} />
                            </button>
                          )}
                        >
                          {(close) => (
                            <div className="py-1">
                              <DropdownItem icon={<Pencil size={15} />} onClick={() => { close(); onEdit(tx); }}>
                                Edit
                              </DropdownItem>
                              <DropdownItem icon={<Trash2 size={15} />} tone="danger" onClick={() => { close(); onDelete(tx); }}>
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
          <div className="flex flex-col gap-3 border-t border-line px-6 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>
              Showing <strong className="font-semibold text-ink">{start}–{end}</strong> of <strong className="font-semibold text-ink">{total}</strong>
            </span>
            {pageCount > 1 && (
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
                  <ChevronLeft size={16} />
                </Button>
                <span className="tabular text-xs font-semibold">
                  {page} / {pageCount}
                </span>
                <Button variant="secondary" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount} aria-label="Next page">
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted", className)}>{children}</th>;
}
