import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AlertTriangle, Camera, Cpu, FileText, ImagePlus, Info, PencilLine, RefreshCw, ScanLine, Sparkles } from "lucide-react";
import type { Upload } from "@sdk/db";
import { useCategories, useDiscardReceipt, useFinalizeReceipt, useScanReceipt, type ScanProgress } from "@sdk/requests";
import { RECEIPT_MIME_TYPES, validateReceiptFile } from "@sdk/storage";
import { FIELD_LABELS, getEnginePreference, isCloudMarkedUnavailable, type ReceiptEngineUsed, type ReceiptExtraction } from "@sdk/receipts";
import { Badge, Button, Skeleton, cn, useToast } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { TransactionForm, type AttentionField, type TransactionPrefill } from "./TransactionForm";

export interface ReceiptScannerProps {
  userId: string;
  /** Start scanning this file immediately (e.g. dropped on the dashboard). */
  initialFile?: File | null;
  defaultCurrency?: string;
  onDone: () => void;
  onCancel: () => void;
  /** Fall back to manual entry, optionally carrying over what was read. */
  onSwitchToManual: (prefill?: TransactionPrefill) => void;
}

type Stage =
  | { kind: "pick" }
  | { kind: "scanning"; file: File }
  | { kind: "review"; file: File; upload: Upload | null; extraction: ReceiptExtraction; engine: ReceiptEngineUsed; notice?: string }
  | { kind: "error"; file: File | null; message: string };

const PROGRESS_LABELS: Record<ScanProgress["stage"], string> = {
  preparing: "Preparing the image…",
  uploading: "Uploading…",
  cloud: "Reading your receipt with AI…",
  "ocr-loading": "Loading the on-device reader (first time only)…",
  ocr: "Reading text on your device…",
  parsing: "Finding the total, date and merchant…",
};

const FIELD_TO_FORM: Record<string, AttentionField> = {
  merchant_name: "merchant_name",
  amount: "amount",
  currency: "currency",
  transaction_date: "transaction_date",
  category: "category_id",
};

export function ReceiptScanner({ userId, initialFile = null, defaultCurrency = "USD", onDone, onCancel, onSwitchToManual }: ReceiptScannerProps) {
  const [stage, setStage] = useState<Stage>(() => (initialFile ? { kind: "scanning", file: initialFile } : { kind: "pick" }));
  const [progress, setProgress] = useState<ScanProgress>({ stage: "preparing" });
  const [dragging, setDragging] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const startedInitial = useRef(false);
  const { data: categories = [] } = useCategories(userId);
  const scan = useScanReceipt(userId);
  const finalize = useFinalizeReceipt(userId);
  const discard = useDiscardReceipt(userId);
  const toast = useToast();

  const previewFile = stage.kind === "pick" ? null : stage.file;
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!previewFile || !previewFile.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(previewFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewFile]);

  const runScan = async (file: File) => {
    const invalid = validateReceiptFile(file);
    if (invalid) {
      setStage({ kind: "error", file: null, message: invalid });
      return;
    }
    setStage({ kind: "scanning", file });
    setProgress({ stage: "preparing" });
    try {
      const result = await scan.mutateAsync({
        file,
        defaultCurrency,
        categories: categories.map((c) => ({ id: c.id, name: c.name })),
        onProgress: setProgress,
      });
      if (!result.extraction.isReceipt) {
        await discard.mutateAsync(result.upload).catch(() => undefined);
        setStage({ kind: "error", file, message: "That doesn't look like a receipt. Try a clearer, well-lit photo of the whole receipt, or enter the details manually." });
        return;
      }
      setStage({ kind: "review", file: result.storedFile, upload: result.upload, extraction: result.extraction, engine: result.engine, notice: result.notice });
    } catch (err) {
      setStage({ kind: "error", file, message: err instanceof Error ? err.message : "Scanning failed. Please try again." });
    }
  };

  // Kick off the scan for a file handed in from outside (once).
  useEffect(() => {
    if (!initialFile || startedInitial.current) return;
    startedInitial.current = true;
    void runScan(initialFile);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once for the initial file
  }, [initialFile]);

  const onPicked = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void runScan(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void runScan(file);
  };

  const cancelReview = async (upload: Upload | null) => {
    await discard.mutateAsync(upload).catch(() => undefined);
    onCancel();
  };

  const pref = getEnginePreference();
  const deviceOnly = pref === "device" || (pref === "auto" && isCloudMarkedUnavailable());

  /* ---------------------------------------------------------------- */

  if (stage.kind === "pick") {
    return (
      <div className="space-y-4">
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPicked} />
        <input ref={fileRef} type="file" accept={RECEIPT_MIME_TYPES.join(",")} className="hidden" onChange={onPicked} />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
            dragging ? "border-brand bg-brand-soft" : "border-line bg-surface-2/60"
          )}
        >
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand">
            <ScanLine size={22} />
          </span>
          <h3 className="mt-4 text-base font-bold">Snap or upload a receipt</h3>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
            We read the merchant, total, date and category for you. You confirm before anything is saved.
          </p>
          <p className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11px] font-medium text-muted ring-1 ring-line">
            {deviceOnly ? <Cpu size={12} /> : <Sparkles size={12} />}
            {deviceOnly ? "Reads on your device — free, nothing is sent to an AI service" : "Uses the AI reader when available, otherwise reads on your device"}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Button size="lg" onClick={() => cameraRef.current?.click()} leftIcon={<Camera size={18} />}>
              Take a photo
            </Button>
            <Button size="lg" variant="secondary" onClick={() => fileRef.current?.click()} leftIcon={<ImagePlus size={18} />}>
              Upload image or PDF
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">JPEG, PNG, WebP or PDF · up to 10 MB · large photos are compressed before upload</p>
        </div>

        <button type="button" onClick={() => onSwitchToManual()} className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
          <PencilLine size={14} /> Enter it manually instead
        </button>
      </div>
    );
  }

  if (stage.kind === "scanning") {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface-2/60 p-4">
          <Thumb url={previewUrl} file={stage.file} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{stage.file.name}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted">
              {progress.engine === "device" ? <Cpu size={14} className="animate-pulse text-brand" /> : <Sparkles size={14} className="animate-pulse text-brand" />}
              {PROGRESS_LABELS[progress.stage]}
              {progress.stage === "ocr" && typeof progress.progress === "number" && ` ${Math.round(progress.progress * 100)}%`}
            </p>
            {progress.stage === "ocr" || progress.stage === "ocr-loading" ? (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-3" aria-hidden>
                <div className="h-full rounded-full bg-series-1 transition-[width] duration-300" style={{ width: `${Math.round((progress.progress ?? 0) * 100)}%` }} />
              </div>
            ) : (
              <p className="mt-1 text-xs text-muted">Extracting merchant, total, date and category.</p>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-10" />
            <Skeleton className="h-10" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
        <Button variant="ghost" size="sm" className="w-full" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  if (stage.kind === "error") {
    return (
      <div className="space-y-4">
        <div className="flex gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4" role="alert">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-danger" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-danger">We couldn't read that receipt</p>
            <p className="mt-0.5 text-sm text-ink-2">{stage.message}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="secondary" className="flex-1" leftIcon={<RefreshCw size={16} />} onClick={() => setStage({ kind: "pick" })}>
            Try another photo
          </Button>
          <Button className="flex-1" leftIcon={<PencilLine size={16} />} onClick={() => onSwitchToManual({ source: "receipt" })}>
            Enter manually
          </Button>
        </div>
      </div>
    );
  }

  /* review */
  const { extraction, upload, file, engine, notice } = stage;
  const attention = extraction.uncertainFields.map((f) => FIELD_TO_FORM[f]).filter(Boolean);
  const pct = Math.round(extraction.confidence * 100);
  const tone = extraction.confidence >= 0.8 ? "good" : extraction.confidence >= 0.5 ? "warn" : "danger";
  const prefill: TransactionPrefill = {
    type: "expense",
    amount: extraction.amount,
    merchant_name: extraction.merchantName,
    transaction_date: extraction.transactionDate,
    currency: extraction.currency,
    category_id: extraction.categoryId,
    source: "receipt",
    description: buildNote(extraction),
    confidence: extraction.confidence,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-2xl border border-line bg-surface-2/60 p-4">
        <Thumb url={previewUrl} file={file} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold">{extraction.merchantName ?? "Unknown merchant"}</p>
            <Badge tone={tone} size="sm" dot>
              {pct}% confident
            </Badge>
            <Badge tone="neutral" size="sm" icon={engine === "device" ? <Cpu size={11} /> : <Sparkles size={11} />}>
              {engine === "device" ? "Read on device" : "Read by AI"}
            </Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted">
            {extraction.amount !== null ? formatCurrency(extraction.amount, extraction.currency) : "Total not found"}
            {extraction.paymentMethod ? ` · ${extraction.paymentMethod}` : ""}
            {extraction.items.length > 0 ? ` · ${extraction.items.length} item${extraction.items.length === 1 ? "" : "s"}` : ""}
          </p>
          {extraction.uncertainFields.length > 0 ? (
            <p className="mt-1.5 text-xs font-medium text-warn">
              Please check: {extraction.uncertainFields.map((f) => FIELD_LABELS[f]).join(", ")}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-muted">Review the details below, then confirm to save.</p>
          )}
          {notice && (
            <p className="mt-1.5 flex items-start gap-1 text-xs text-muted">
              <Info size={12} className="mt-0.5 shrink-0" /> {notice}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setStage({ kind: "pick" })} leftIcon={<RefreshCw size={14} />} aria-label="Rescan">
          Rescan
        </Button>
      </div>

      <TransactionForm
        userId={userId}
        prefill={prefill}
        attention={attention}
        defaultCurrency={defaultCurrency}
        submitLabel="Confirm & save"
        onCancel={() => void cancelReview(upload)}
        onSuccess={async (tx) => {
          try {
            await finalize.mutateAsync({ upload, transactionId: tx.id, extraction });
          } catch {
            toast.error("Saved, but couldn't link the receipt image.");
          }
          onDone();
        }}
      />
    </div>
  );
}

function buildNote(extraction: ReceiptExtraction): string | null {
  if (extraction.items.length === 0) return null;
  const lines = extraction.items.slice(0, 8).map((it) => (it.amount !== null ? `${it.name} — ${formatCurrency(it.amount, extraction.currency)}` : it.name));
  const more = extraction.items.length > 8 ? ` (+${extraction.items.length - 8} more)` : "";
  return `Items: ${lines.join("; ")}${more}`;
}

function Thumb({ url, file }: { url: string | null; file: File }) {
  return (
    <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-surface">
      {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <FileText size={22} className="text-muted" aria-label={file.name} />}
    </span>
  );
}
