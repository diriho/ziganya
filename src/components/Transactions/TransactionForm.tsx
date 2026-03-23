import { useState } from "react";
import { useCategories, useCreateTransaction, useCurrentUser } from "@sdk/requests";
import type { TransactionInsert } from "@sdk/db";

interface TransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TransactionForm = ({ onSuccess, onCancel }: TransactionFormProps) => {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [formData, setFormData] = useState<Omit<TransactionInsert, "user_id">>({
    amount: 0,
    type: "expense",
    merchant_name: "",
    transaction_date: new Date().toISOString().split("T")[0],
    source: "manual",
    currency: "USD",
    description: null,
    category_id: null,
    notes: null,
  });

  const createTransaction = useCreateTransaction(user?.userID ?? "");
  const { data: categories = [] } = useCategories(user?.userID ?? "");

  if (userLoading || !user?.userID) {
    return <div className="py-6 text-center text-zinc-500">Loading user info…</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTransaction.mutateAsync(formData);
      onSuccess();
    } catch (error) {
      console.error("Failed to create transaction:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Type *
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
          required
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Amount *
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.amount || ""}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
          required
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Merchant Name
        </label>
        <input
          type="text"
          value={formData.merchant_name || ""}
          onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value || null })}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
          placeholder="e.g., Amazon, Salary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Date *
        </label>
        <input
          type="date"
          value={formData.transaction_date}
          onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Source *
        </label>
        <select
          value={formData.source}
          onChange={(e) => setFormData({ ...formData, source: e.target.value })}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
          required
        >
          <option value="manual">Manual</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="credit_card">Credit Card</option>
          <option value="cash">Cash</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Category
        </label>
        <select
          value={formData.category_id || ""}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value || null })}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          <option value="">None</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description || ""}
          onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green"
          rows={3}
          placeholder="Optional notes"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createTransaction.isPending}
          className="flex-1 px-4 py-2 bg-brand-green text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {createTransaction.isPending ? "Adding..." : "Add Transaction"}
        </button>
      </div>
    </form>
  );
};
