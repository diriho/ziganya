import { useState, type FormEvent } from "react";
import { PencilLine, PiggyBank, ScanLine, Target } from "lucide-react";
import type { Transaction } from "@sdk/db";
import { useAuth } from "@sdk/auth";
import { useUser, useUserUpdate } from "@sdk/requests";
import { Button, FormField, Modal, MoneyInput, Segmented, useToast } from "@/components/ui";
import { formatCurrency } from "@/lib/format";
import { TransactionForm, type TransactionPrefill } from "./TransactionForm";
import { ReceiptScanner } from "./ReceiptScanner";

export type QuickAddMode = "transaction" | "scan" | "goal";

export interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  /** Edit this transaction instead of creating a new one (hides the other tabs). */
  transaction?: Transaction | null;
  /** Show the "Savings goal" tab (dashboard quick-add). */
  allowGoal?: boolean;
  /** Which tab to open on. */
  initialMode?: QuickAddMode;
  /** Start scanning this file right away (opens in scan mode). */
  initialFile?: File | null;
  defaultCurrency?: string;
}

export function TransactionModal({ open, onClose, transaction = null, allowGoal = false, initialMode, initialFile = null, defaultCurrency }: TransactionModalProps) {
  const isEdit = !!transaction;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit transaction" : allowGoal ? "Quick add" : "Add transaction"}
      description={isEdit ? "Update the details below." : "Scan a receipt or type it in. Nothing is saved until you confirm."}
    >
      {/* Remounts each time the modal opens so every inner state resets. */}
      {open && (
        <ModalBody
          key={transaction?.id ?? "new"}
          transaction={transaction}
          allowGoal={allowGoal && !isEdit}
          initialMode={initialFile ? "scan" : initialMode}
          initialFile={initialFile}
          onClose={onClose}
          defaultCurrency={defaultCurrency}
        />
      )}
    </Modal>
  );
}

function ModalBody({
  transaction,
  allowGoal,
  initialMode,
  initialFile,
  onClose,
  defaultCurrency,
}: {
  transaction: Transaction | null;
  allowGoal: boolean;
  initialMode?: QuickAddMode;
  initialFile: File | null;
  onClose: () => void;
  defaultCurrency?: string;
}) {
  const { user } = useAuth();
  const userId = user?.userID ?? "";
  const [mode, setMode] = useState<QuickAddMode>(initialMode ?? "scan");
  const [manualPrefill, setManualPrefill] = useState<TransactionPrefill | null>(null);

  if (transaction) {
    return <TransactionForm userId={userId} initial={transaction} defaultCurrency={defaultCurrency} onSuccess={onClose} onCancel={onClose} />;
  }

  const switchToManual = (prefill?: TransactionPrefill) => {
    setManualPrefill(prefill ?? null);
    setMode("transaction");
  };

  return (
    <div className="space-y-5">
      <Segmented<QuickAddMode>
        ariaLabel="Quick add mode"
        value={mode}
        onChange={setMode}
        className="w-full [&>button]:flex-1"
        options={[
          { value: "scan", label: "Scan receipt", icon: <ScanLine size={14} /> },
          { value: "transaction", label: "Manual", icon: <PencilLine size={14} /> },
          ...(allowGoal ? [{ value: "goal" as const, label: "Savings goal", icon: <Target size={14} /> }] : []),
        ]}
      />
      {mode === "scan" ? (
        <ReceiptScanner userId={userId} initialFile={initialFile} defaultCurrency={defaultCurrency} onDone={onClose} onCancel={onClose} onSwitchToManual={switchToManual} />
      ) : mode === "transaction" ? (
        <TransactionForm key={manualPrefill ? "prefilled" : "blank"} userId={userId} prefill={manualPrefill} defaultCurrency={defaultCurrency} onSuccess={onClose} onCancel={onClose} />
      ) : (
        <GoalForm userId={userId} onDone={onClose} />
      )}
    </div>
  );
}

function GoalForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const { data: userRow, isLoading } = useUser(userId);
  const update = useUserUpdate(userId);
  const toast = useToast();
  const [amount, setAmount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const currentGoal = Number(userRow?.savings_goal ?? 0);
  const currentBalance = Number(userRow?.total_balance ?? 0);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const goal = amount === "" ? currentGoal : Number(amount);
    const bal = balance === "" ? currentBalance : Number(balance);
    if (!Number.isFinite(goal) || goal < 0 || !Number.isFinite(bal)) {
      setError("Enter valid amounts.");
      return;
    }
    try {
      await update.mutateAsync({ savings_goal: goal, total_balance: bal });
      toast.success("Goal saved", goal > 0 ? `Saving toward ${formatCurrency(goal)}.` : "Savings goal cleared.");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your goal.");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start gap-3 rounded-2xl bg-brand-soft p-4 text-brand">
        <PiggyBank size={20} className="mt-0.5 shrink-0" />
        <div className="text-sm leading-5">
          <p className="font-semibold">Current goal: {currentGoal > 0 ? formatCurrency(currentGoal) : "not set"}</p>
          <p className="opacity-80">Progress is measured against your total balance ({formatCurrency(currentBalance)}).</p>
        </div>
      </div>
      <FormField label="Savings goal" htmlFor="goal-amount" hint="Leave blank to keep the current value.">
        <MoneyInput id="goal-amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={currentGoal ? String(currentGoal) : "5,000.00"} disabled={isLoading} />
      </FormField>
      <FormField label="Total balance" htmlFor="goal-balance" hint="Your current balance across accounts." error={error}>
        <MoneyInput id="goal-balance" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder={String(currentBalance)} disabled={isLoading} />
      </FormField>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onDone} className="flex-1" disabled={update.isPending}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" loading={update.isPending} disabled={isLoading}>
          Save goal
        </Button>
      </div>
    </form>
  );
}
