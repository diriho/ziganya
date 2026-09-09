import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Link } from "react-router";
import { ArrowRight, FileText, Receipt, ScanLine, Image as ImageIcon } from "lucide-react";
import type { Category, Transaction, Upload as UploadRow } from "@sdk/db";
import { RECEIPT_MIME_TYPES, validateReceiptFile } from "@sdk/storage";
import { Badge, Card, CardHeader, EmptyState, cn, useToast } from "@/components/ui";
import { isExpense } from "@/lib/analytics";
import { formatRelativeDay, formatSignedAmount, formatTimeAgo } from "@/lib/format";
import { sourceMeta } from "@/lib/sources";

export interface RecentActivityProps {
  userId: string;
  transactions: Transaction[];
  categories: Category[];
  uploads: UploadRow[];
  limit?: number;
  /** Hand a dropped/picked receipt to the scan flow. */
  onScanFile: (file: File) => void;
}

function uploadTone(status: string | null): "good" | "warn" | "danger" | "neutral" {
  const s = (status ?? "").toLowerCase();
  if (s === "processed" || s === "completed" || s === "done") return "good";
  if (s === "failed" || s === "error") return "danger";
  if (s === "pending" || s === "processing") return "warn";
  return "neutral";
}

export function RecentActivity({ transactions, categories, uploads, limit = 6, onScanFile }: RecentActivityProps) {
  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => (b.transaction_date ?? "").localeCompare(a.transaction_date ?? "") || (b.created_at ?? "").localeCompare(a.created_at ?? ""))
        .slice(0, limit),
    [transactions, limit]
  );

  return (
    <Card padding="md" className="flex h-full flex-col">
      <CardHeader
        title="Recent activity"
        subtitle="Latest transactions and receipts"
        action={
          <Link to="/dashboard/transactions" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        }
      />

      {recent.length === 0 ? (
        <EmptyState compact icon={<Receipt size={20} />} title="No transactions yet" description="Your latest activity will appear here." />
      ) : (
        <ul className="-mx-2 divide-y divide-line">
          {recent.map((tx) => {
            const expense = isExpense(tx);
            const { Icon, label } = sourceMeta(tx.source);
            const title = tx.merchant_name || tx.description || (expense ? "Expense" : "Income");
            const cat = tx.category_id ? categoryName.get(tx.category_id) : null;
            return (
              <li key={tx.id} className="flex items-center gap-3 px-2 py-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2" title={label}>
                  <Icon size={17} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{title}</p>
                  <p className="truncate text-xs text-muted">
                    {cat ?? label}
                    <span aria-hidden> · </span>
                    {formatRelativeDay(tx.transaction_date)}
                  </p>
                </div>
                <p className={cn("tabular shrink-0 text-sm font-semibold", expense ? "text-ink" : "text-good")}>
                  {formatSignedAmount(tx.amount, expense, tx.currency || "USD")}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <ReceiptDropzone uploads={uploads} onScanFile={onScanFile} />
    </Card>
  );
}

function ReceiptDropzone({ uploads, onScanFile }: { uploads: UploadRow[]; onScanFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const toast = useToast();

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const invalid = validateReceiptFile(file);
    if (invalid) {
      toast.error("Can't scan that file", invalid);
      return;
    }
    onScanFile(file);
  };

  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="mt-5 border-t border-line pt-5">
      <input
        ref={inputRef}
        type="file"
        accept={RECEIPT_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "group flex w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed px-4 py-4 text-sm font-semibold transition-colors",
          dragging ? "border-brand bg-brand-soft text-brand" : "border-line text-muted hover:border-brand/50 hover:bg-surface-2 hover:text-ink"
        )}
      >
        <span className="inline-flex items-center gap-2">
          <ScanLine size={17} className="transition-transform group-hover:-translate-y-0.5" />
          Scan a receipt
        </span>
        <span className="text-xs font-normal text-muted">Drop a photo or PDF here — we'll read it and ask you to confirm</span>
      </button>

      {uploads.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {uploads.slice(0, 3).map((u) => (
            <li key={u.id} className="flex items-center gap-2.5 rounded-xl px-1 py-1 text-xs">
              <span className="text-muted">{u.type === "pdf" ? <FileText size={14} /> : <ImageIcon size={14} />}</span>
              <span className="min-w-0 flex-1 truncate font-medium text-ink-2">{u.file_name ?? "Receipt"}</span>
              <span className="text-muted">{formatTimeAgo(u.created_at)}</span>
              <Badge tone={uploadTone(u.status)} size="sm">
                {u.status ?? "pending"}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
