import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  loading?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  loading,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      locked={loading}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div
          className={
            tone === "danger"
              ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-danger-soft text-danger"
              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand"
          }
        >
          <AlertTriangle size={20} />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
          {error && (
            <p className="mt-3 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
