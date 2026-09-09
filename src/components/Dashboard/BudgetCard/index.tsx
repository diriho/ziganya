import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Pencil, PiggyBank, TrendingDown } from "lucide-react";
import type { Budget } from "@sdk/db";
import { useCreateBudget, useUpdateBudget } from "@sdk/requests";
import { Badge, Button, Card, CardHeader, FormField, MoneyInput, useToast } from "@/components/ui";
import { RingMeter } from "@/components/charts";
import { budgetStatus, pickOverallBudget } from "@/lib/analytics";
import { endOfMonth } from "@/lib/dates";
import { formatCurrency } from "@/lib/format";

export interface BudgetCardProps {
  userId: string;
  budgets: Budget[];
  monthSpent: number;
  currency: string;
}

export function BudgetCard({ userId, budgets, monthSpent, currency }: BudgetCardProps) {
  const overall = useMemo(() => pickOverallBudget(budgets), [budgets]);
  const status = useMemo(() => budgetStatus(overall, monthSpent), [overall, monthSpent]);
  const [editing, setEditing] = useState(false);

  const today = new Date();
  const daysLeft = endOfMonth(today).getDate() - today.getDate() + 1;
  const dailyAllowance = status.remaining / Math.max(1, daysLeft);
  const pct = Math.round(status.ratio * 100);

  const badge =
    status.state === "over" ? (
      <Badge tone="danger" icon={<AlertTriangle size={12} />}>Over budget</Badge>
    ) : status.state === "warn" ? (
      <Badge tone="warn" icon={<TrendingDown size={12} />}>Near limit</Badge>
    ) : (
      <Badge tone="good" icon={<CheckCircle2 size={12} />}>On track</Badge>
    );

  return (
    <Card padding="md" className="flex h-full flex-col">
      <CardHeader
        title="Monthly budget"
        subtitle={overall ? `${formatCurrency(status.limit, currency)} for ${today.toLocaleDateString("en-US", { month: "long" })}` : "Set a spending limit for the month"}
        action={
          overall && !editing ? (
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)} aria-label="Edit budget">
              <Pencil size={15} />
            </Button>
          ) : undefined
        }
      />

      {!overall || editing ? (
        <BudgetForm
          userId={userId}
          budget={overall}
          currency={currency}
          onDone={() => setEditing(false)}
          onCancel={overall ? () => setEditing(false) : undefined}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center">
          <RingMeter ratio={status.ratio} state={status.state} size={172} thickness={14} label={`${pct}% of budget used`}>
            <span className="font-display text-3xl font-bold leading-none">{pct}%</span>
            <span className="eyebrow mt-1.5">used</span>
          </RingMeter>
          <div className="mt-4">{badge}</div>
          <dl className="mt-5 grid w-full grid-cols-3 gap-3 text-center">
            <Row label="Spent" value={formatCurrency(status.spent, currency)} />
            <Row label="Left" value={formatCurrency(status.remaining, currency)} />
            <Row label={`Per day · ${daysLeft}d`} value={formatCurrency(dailyAllowance, currency)} />
          </dl>
        </div>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-2 py-2.5">
      <dt className="text-[11px] font-medium text-muted">{label}</dt>
      <dd className="tabular mt-0.5 truncate text-sm font-semibold">{value}</dd>
    </div>
  );
}

function BudgetForm({
  userId,
  budget,
  currency,
  onDone,
  onCancel,
}: {
  userId: string;
  budget: Budget | null;
  currency: string;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [amount, setAmount] = useState<string>(budget ? String(budget.amount) : "");
  const [error, setError] = useState<string | null>(null);
  const create = useCreateBudget(userId);
  const update = useUpdateBudget(userId);
  const toast = useToast();
  const pending = create.isPending || update.isPending;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setError(null);
    try {
      if (budget) {
        await update.mutateAsync({ id: budget.id, amount: value });
        toast.success("Budget updated", `Monthly limit is now ${formatCurrency(value, currency)}.`);
      } else {
        await create.mutateAsync({ amount: value, period: "monthly", category_id: null, alert_enabled: true, alert_threshold: 80 });
        toast.success("Budget set", `We'll warn you at 80% of ${formatCurrency(value, currency)}.`);
      }
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the budget.");
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-1 flex-col">
      {!budget && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-brand-soft p-4 text-brand">
          <PiggyBank size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-5">
            A monthly budget turns this card into a live meter of how much you have left to spend.
          </p>
        </div>
      )}
      <FormField label="Monthly limit" htmlFor="budget-amount" error={error} required>
        <MoneyInput id="budget-amount" currency={currency} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1,500.00" autoFocus />
      </FormField>
      <div className="mt-auto flex gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel} className="flex-1" disabled={pending}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" loading={pending}>
          {budget ? "Save" : "Set budget"}
        </Button>
      </div>
    </form>
  );
}
