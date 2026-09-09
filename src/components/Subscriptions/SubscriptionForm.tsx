import { useState, type FormEvent } from "react";
import type { Subscription } from "@sdk/db";
import { useCreateSubscription, useUpdateSubscription, type SubscriptionPayload } from "@sdk/requests";
import { Button, FormField, Input, MoneyInput, Select, useToast } from "@/components/ui";
import { toDateKey } from "@/lib/dates";
import { BILLING_CYCLES, CURRENCY_OPTIONS, SUBSCRIPTION_STATUSES } from "@/lib/sources";

export interface SubscriptionFormProps {
  userId: string;
  initial?: Subscription | null;
  defaultCurrency?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormState {
  name: string;
  amount: string;
  currency: string;
  billing_cycle: string;
  next_billing_date: string;
  status: string;
}

export function SubscriptionForm({ userId, initial, defaultCurrency = "USD", onSuccess, onCancel }: SubscriptionFormProps) {
  const [form, setForm] = useState<FormState>(() => ({
    name: initial?.name ?? "",
    amount: initial ? String(initial.amount) : "",
    currency: initial?.currency ?? defaultCurrency,
    billing_cycle: initial?.billing_cycle ?? "monthly",
    next_billing_date: initial?.next_billing_date?.slice(0, 10) ?? toDateKey(new Date()),
    status: initial?.status ?? "active",
  }));
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const create = useCreateSubscription(userId);
  const update = useUpdateSubscription(userId);
  const toast = useToast();
  const pending = create.isPending || update.isPending;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    const amount = Number(form.amount);
    if (!form.name.trim()) next.name = "Give the subscription a name.";
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) next.amount = "Enter an amount greater than zero.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const payload: SubscriptionPayload = {
      name: form.name.trim(),
      amount: Math.round(amount * 100) / 100,
      currency: form.currency,
      billing_cycle: form.billing_cycle,
      next_billing_date: form.next_billing_date || null,
      status: form.status,
    };
    try {
      if (initial) {
        await update.mutateAsync({ id: initial.id, ...payload });
        toast.success("Subscription updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Subscription added", `${payload.name} is now tracked.`);
      }
      onSuccess();
    } catch (err) {
      toast.error("Could not save subscription", err instanceof Error ? err.message : undefined);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <FormField label="Name" htmlFor="sub-name" error={errors.name} required>
        <Input id="sub-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Netflix, Gym, Rent" autoFocus invalid={!!errors.name} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">
        <FormField label="Amount" htmlFor="sub-amount" error={errors.amount} required>
          <MoneyInput id="sub-amount" currency={form.currency} value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00" invalid={!!errors.amount} />
        </FormField>
        <FormField label="Currency" htmlFor="sub-currency">
          <Select id="sub-currency" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
            {Array.from(new Set([form.currency, ...CURRENCY_OPTIONS])).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Billing cycle" htmlFor="sub-cycle">
          <Select id="sub-cycle" value={form.billing_cycle} onChange={(e) => set("billing_cycle", e.target.value)}>
            {Array.from(new Set([form.billing_cycle, ...BILLING_CYCLES.map((b) => b.value)])).map((v) => (
              <option key={v} value={v}>
                {BILLING_CYCLES.find((b) => b.value === v)?.label ?? v}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Next billing date" htmlFor="sub-date">
          <Input id="sub-date" type="date" value={form.next_billing_date} onChange={(e) => set("next_billing_date", e.target.value)} />
        </FormField>
      </div>
      <FormField label="Status" htmlFor="sub-status">
        <Select id="sub-status" value={form.status} onChange={(e) => set("status", e.target.value)}>
          {Array.from(new Set([form.status, ...SUBSCRIPTION_STATUSES.map((s) => s.value)])).map((v) => (
            <option key={v} value={v}>
              {SUBSCRIPTION_STATUSES.find((s) => s.value === v)?.label ?? v}
            </option>
          ))}
        </Select>
      </FormField>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1" disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={pending}>
          {initial ? "Save changes" : "Add subscription"}
        </Button>
      </div>
    </form>
  );
}
