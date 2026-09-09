import { useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import type { Transaction } from "@sdk/db";
import { useCategories, useCreateTransaction, useUpdateTransaction, type TransactionPayload } from "@sdk/requests";
import { Button, FormField, Input, MoneyInput, Segmented, Select, Textarea, useToast } from "@/components/ui";
import { toDateKey } from "@/lib/dates";
import { CURRENCY_OPTIONS, SOURCE_OPTIONS } from "@/lib/sources";

export type TxType = "expense" | "income";

/** Values to pre-populate a new transaction with (e.g. from a scanned receipt). */
export interface TransactionPrefill {
  type?: TxType;
  amount?: number | null;
  merchant_name?: string | null;
  transaction_date?: string | null;
  source?: string;
  currency?: string | null;
  category_id?: string | null;
  description?: string | null;
  /** Extraction confidence 0..1, stored on the row. */
  confidence?: number | null;
}

export type AttentionField = "amount" | "merchant_name" | "transaction_date" | "currency" | "category_id";

export interface TransactionFormProps {
  userId: string;
  /** When provided the form edits this transaction instead of creating one. */
  initial?: Transaction | null;
  /** Starting values for a new transaction. Ignored when `initial` is set. */
  prefill?: TransactionPrefill | null;
  /** Fields the user should double-check (highlighted with a warning). */
  attention?: AttentionField[];
  defaultCurrency?: string;
  submitLabel?: string;
  onSuccess: (transaction: Transaction) => void;
  onCancel: () => void;
}

interface FormState {
  type: TxType;
  amount: string;
  merchant_name: string;
  transaction_date: string;
  source: string;
  currency: string;
  category_id: string;
  description: string;
}

function initialState(initial: Transaction | null | undefined, defaultCurrency: string, prefill?: TransactionPrefill | null): FormState {
  if (initial) {
    return {
      type: (initial.type ?? "expense").toLowerCase() === "income" ? "income" : "expense",
      amount: String(Math.abs(Number(initial.amount))),
      merchant_name: initial.merchant_name ?? "",
      transaction_date: initial.transaction_date?.slice(0, 10) ?? toDateKey(new Date()),
      source: initial.source ?? "manual",
      currency: initial.currency ?? defaultCurrency,
      category_id: initial.category_id ?? "",
      description: initial.description ?? "",
    };
  }
  return {
    type: prefill?.type ?? "expense",
    amount: prefill?.amount != null ? String(prefill.amount) : "",
    merchant_name: prefill?.merchant_name ?? "",
    transaction_date: prefill?.transaction_date ?? toDateKey(new Date()),
    source: prefill?.source ?? "manual",
    currency: prefill?.currency ?? defaultCurrency,
    category_id: prefill?.category_id ?? "",
    description: prefill?.description ?? "",
  };
}

const attentionClass = "border-warn ring-2 ring-warn/30";
const CHECK_HINT = "Double-check this value against the receipt.";

export function TransactionForm({
  userId,
  initial,
  prefill,
  attention = [],
  defaultCurrency = "USD",
  submitLabel,
  onSuccess,
  onCancel,
}: TransactionFormProps) {
  const [form, setForm] = useState<FormState>(() => initialState(initial, defaultCurrency, prefill));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const { data: categories = [] } = useCategories(userId);
  const create = useCreateTransaction(userId);
  const update = useUpdateTransaction(userId);
  const toast = useToast();
  const pending = create.isPending || update.isPending;
  const isEdit = !!initial;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setTouched((t) => (t.has(key) ? t : new Set(t).add(key)));
  };
  const needsCheck = (key: AttentionField) => attention.includes(key) && !touched.has(key);

  const validate = (): boolean => {
    const next: typeof errors = {};
    const amount = Number(form.amount);
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) next.amount = "Enter an amount greater than zero.";
    if (!form.transaction_date) next.transaction_date = "Pick a date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: TransactionPayload = {
      type: form.type,
      amount: Math.round(Number(form.amount) * 100) / 100,
      merchant_name: form.merchant_name.trim() || null,
      transaction_date: form.transaction_date,
      source: form.source,
      currency: form.currency,
      category_id: form.category_id || null,
      description: form.description.trim() || null,
      ...(prefill && !isEdit ? { confidence: prefill.confidence ?? null, is_verified: true } : {}),
    };
    try {
      if (isEdit && initial) {
        const row = await update.mutateAsync({ id: initial.id, ...payload });
        toast.success("Transaction updated");
        onSuccess(row);
      } else {
        const row = await create.mutateAsync(payload);
        toast.success(prefill ? "Saved from receipt" : "Transaction added", `${payload.merchant_name ?? (form.type === "income" ? "Income" : "Expense")} recorded.`);
        onSuccess(row);
      }
    } catch (err) {
      toast.error(isEdit ? "Could not update transaction" : "Could not add transaction", err instanceof Error ? err.message : undefined);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Segmented<TxType>
        ariaLabel="Transaction type"
        value={form.type}
        onChange={(v) => set("type", v)}
        className="w-full [&>button]:flex-1"
        options={[
          { value: "expense", label: "Expense", icon: <ArrowUpRight size={14} /> },
          { value: "income", label: "Income", icon: <ArrowDownLeft size={14} /> },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">
        <FormField label="Amount" htmlFor="tx-amount" error={errors.amount} hint={needsCheck("amount") ? CHECK_HINT : undefined} required>
          <MoneyInput
            id="tx-amount"
            currency={form.currency}
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="0.00"
            autoFocus={!prefill}
            invalid={!!errors.amount}
            className={needsCheck("amount") ? attentionClass : undefined}
          />
        </FormField>
        <FormField label="Currency" htmlFor="tx-currency" hint={needsCheck("currency") ? "Check" : undefined}>
          <Select id="tx-currency" value={form.currency} onChange={(e) => set("currency", e.target.value)} className={needsCheck("currency") ? attentionClass : undefined}>
            {Array.from(new Set([form.currency, ...CURRENCY_OPTIONS])).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label={form.type === "income" ? "Payer" : "Merchant"} htmlFor="tx-merchant" hint={needsCheck("merchant_name") ? CHECK_HINT : undefined}>
        <Input
          id="tx-merchant"
          value={form.merchant_name}
          onChange={(e) => set("merchant_name", e.target.value)}
          placeholder={form.type === "income" ? "e.g. Employer, Client" : "e.g. Whole Foods, Netflix"}
          className={needsCheck("merchant_name") ? attentionClass : undefined}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Date" htmlFor="tx-date" error={errors.transaction_date} hint={needsCheck("transaction_date") ? CHECK_HINT : undefined} required>
          <Input
            id="tx-date"
            type="date"
            value={form.transaction_date}
            onChange={(e) => set("transaction_date", e.target.value)}
            max={toDateKey(new Date())}
            invalid={!!errors.transaction_date}
            className={needsCheck("transaction_date") ? attentionClass : undefined}
          />
        </FormField>
        <FormField label="Source" htmlFor="tx-source">
          <Select id="tx-source" value={form.source} onChange={(e) => set("source", e.target.value)}>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField
        label="Category"
        htmlFor="tx-category"
        hint={needsCheck("category_id") ? "Pick the best match." : categories.length === 0 ? "No categories yet — transactions will show as uncategorized." : undefined}
      >
        <Select id="tx-category" value={form.category_id} onChange={(e) => set("category_id", e.target.value)} className={needsCheck("category_id") ? attentionClass : undefined}>
          <option value="">Uncategorized</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Note" htmlFor="tx-description">
        <Textarea id="tx-description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional details" rows={2} />
      </FormField>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1" disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={pending}>
          {submitLabel ?? (isEdit ? "Save changes" : form.type === "income" ? "Add income" : "Add expense")}
        </Button>
      </div>
    </form>
  );
}
