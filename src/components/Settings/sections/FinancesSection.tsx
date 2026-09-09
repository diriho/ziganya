import { useState, type FormEvent } from "react";
import { useAuth } from "@sdk/auth";
import { useUser, useUserUpdate } from "@sdk/requests";
import { Button, FormField, MoneyInput, Skeleton, useToast } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { SettingsSection } from "../SettingsSection";

export function FinancesSection() {
  const { user } = useAuth();
  const userId = user?.userID ?? "";
  const { data: row, isLoading } = useUser(userId);
  const update = useUserUpdate(userId);
  const toast = useToast();
  const [balance, setBalance] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);

  const currentBalance = Number(row?.total_balance ?? 0);
  const currentGoal = Number(row?.savings_goal ?? 0);
  const balanceValue = balance ?? String(currentBalance);
  const goalValue = goal ?? String(currentGoal);
  const dirty = Number(balanceValue) !== currentBalance || Number(goalValue) !== currentGoal;
  const progress = currentGoal > 0 ? Math.min(100, Math.round((currentBalance / currentGoal) * 100)) : null;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const b = Number(balanceValue);
    const g = Number(goalValue);
    if (!Number.isFinite(b) || !Number.isFinite(g) || g < 0) {
      toast.error("Enter valid amounts");
      return;
    }
    try {
      await update.mutateAsync({ total_balance: b, savings_goal: g });
      toast.success("Finances updated");
      setBalance(null);
      setGoal(null);
    } catch (err) {
      toast.error("Could not save", err instanceof Error ? err.message : undefined);
    }
  };

  return (
    <SettingsSection id="finances" title="Balance & goal" description="The figures your dashboard headline tiles are built on.">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <form onSubmit={save} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Total balance" htmlFor="fin-balance" hint="Across all your accounts, right now.">
              <MoneyInput id="fin-balance" value={balanceValue} onChange={(e) => setBalance(e.target.value)} />
            </FormField>
            <FormField label="Savings goal" htmlFor="fin-goal" hint="Set to 0 to hide goal progress.">
              <MoneyInput id="fin-goal" value={goalValue} onChange={(e) => setGoal(e.target.value)} />
            </FormField>
          </div>

          {progress !== null && (
            <div className="rounded-xl bg-surface-2 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-ink-2">Progress toward {formatCurrency(currentGoal)}</span>
                <span className="tabular font-semibold">{progress}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-series-1 transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            {dirty && (
              <Button type="button" variant="secondary" onClick={() => { setBalance(null); setGoal(null); }} disabled={update.isPending}>
                Reset
              </Button>
            )}
            <Button type="submit" disabled={!dirty} loading={update.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      )}
    </SettingsSection>
  );
}
