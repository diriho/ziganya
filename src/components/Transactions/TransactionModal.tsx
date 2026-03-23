import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PiggyBank, Plus, Target, X } from "lucide-react";
import { useCurrentUser, useUser, useUserUpdate } from "@sdk/requests";
import { TransactionForm } from "./TransactionForm";
import { formatCurrency } from "@/lib/format";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionModal = ({ isOpen, onClose }: TransactionModalProps) => {
  const [mode, setMode] = useState<"transaction" | "goal">("transaction");
  const [goalPeriod, setGoalPeriod] = useState<"monthly" | "annual">("monthly");
  const [goalAmount, setGoalAmount] = useState(0);
  const { user, isLoading: userLoading } = useCurrentUser();
  const { data: userRow, isLoading: userRowLoading } = useUser(user?.userID ?? "");
  const updateUser = useUserUpdate(user?.userID ?? "");

  useEffect(() => {
    if (!isOpen) {
      setMode("transaction");
      return;
    }

    setGoalAmount(Number(userRow?.savings_goal ?? 0));
  }, [isOpen, userRow?.savings_goal]);

  if (!isOpen) return null;

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.userID) {
      return;
    }

    await updateUser.mutateAsync({
      total_balance: Number(userRow?.total_balance ?? 0),
      savings_goal: goalAmount,
    });

    onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-[90%] max-w-125 max-h-[90vh] overflow-y-auto relative p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="mb-6 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-brand-green">Add Transaction</h2>
            <p className="mt-1 text-sm text-zinc-500">Add a transaction or save a monthly or annual goal to your profile.</p>
          </div>
          <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
            <button
              type="button"
              onClick={() => setMode("transaction")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                mode === "transaction" ? "bg-white text-brand-green shadow-sm" : "text-zinc-500"
              }`}
            >
              <Plus size={16} />
              Transaction
            </button>
            <button
              type="button"
              onClick={() => setMode("goal")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                mode === "goal" ? "bg-white text-brand-green shadow-sm" : "text-zinc-500"
              }`}
            >
              <Target size={16} />
              Set Saving Goal
            </button>
          </div>
        </div>

        {mode === "transaction" ? (
          <TransactionForm onSuccess={onClose} onCancel={onClose} />
        ) : (
          <form onSubmit={handleSaveGoal} className="space-y-4">
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-brand-green">
                <PiggyBank size={16} />
                Current goal: {formatCurrency(Number(userRow?.savings_goal ?? 0))}
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Choose whether this is a monthly or annual goal, then save the amount to your profile.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">Goal period</label>
              <select
                value={goalPeriod}
                onChange={(e) => setGoalPeriod(e.target.value as "monthly" | "annual")}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700">
                {goalPeriod === "monthly" ? "Monthly goal amount" : "Annual goal amount"}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={goalAmount || ""}
                onChange={(e) => setGoalAmount(Number(e.target.value) || 0)}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green"
                placeholder="0.00"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-zinc-700 transition-colors hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateUser.isPending || userLoading || userRowLoading}
                className="flex-1 rounded-lg bg-brand-green px-4 py-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {updateUser.isPending ? "Saving..." : "Save Goal"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
