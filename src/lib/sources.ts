import { Banknote, CreditCard, Landmark, MoreHorizontal, PencilLine, Receipt, Smartphone, type LucideIcon } from "lucide-react";

export interface SourceMeta {
  value: string;
  label: string;
  Icon: LucideIcon;
}

export const SOURCE_OPTIONS: SourceMeta[] = [
  { value: "manual", label: "Manual", Icon: PencilLine },
  { value: "receipt", label: "Receipt", Icon: Receipt },
  { value: "screenshot", label: "Screenshot", Icon: Smartphone },
  { value: "bank_transfer", label: "Bank transfer", Icon: Landmark },
  { value: "credit_card", label: "Credit card", Icon: CreditCard },
  { value: "cash", label: "Cash", Icon: Banknote },
  { value: "other", label: "Other", Icon: MoreHorizontal },
];

export function sourceMeta(source: string | null | undefined): SourceMeta {
  const key = (source ?? "manual").toLowerCase();
  return SOURCE_OPTIONS.find((s) => s.value === key) ?? { value: key, label: key.replace(/_/g, " "), Icon: MoreHorizontal };
}

export const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD", "RWF", "BIF", "KES", "UGX", "TZS", "INR", "NGN"];

export const BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "weekly", label: "Weekly" },
  { value: "quarterly", label: "Quarterly" },
];

export const SUBSCRIPTION_STATUSES = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "cancelled", label: "Cancelled" },
];
