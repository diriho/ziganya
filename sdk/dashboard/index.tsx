import { useEffect, useState } from "react";
import { supabase } from "@db/database";
import type { Transaction, Category } from "@db/database.types";

export default function TransactionLayer() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch transactions and categories in parallel
      const [transactionsRes, categoriesRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .order("transaction_date", { ascending: false })
          .limit(10),
        supabase.from("categories").select("*"),
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setTransactions(transactionsRes.data ?? []);
      setCategories(categoriesRes.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total spending
  const totalSpending = transactions.reduce((sum, t) => {
    return t.type === "expense" ? sum + t.amount : sum;
  }, 0);

  // Get category name by ID
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name ?? "Uncategorized";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your spending</p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <p className="text-sm text-gray-500 mb-1">Total Spending</p>
          <p className="text-4xl font-bold text-green-900">
            ${totalSpending.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            {transactions.length} transactions
          </p>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No transactions yet. Upload a receipt to get started!
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {transactions.map((t) => (
                <li
                  key={t.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {t.merchant_name ?? t.description ?? "Unknown"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getCategoryName(t.category_id)} •{" "}
                        {new Date(t.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          t.type === "expense"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {t.type === "expense" ? "-" : "+"}${t.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {t.source}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}