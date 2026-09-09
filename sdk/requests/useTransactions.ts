import { dbClient, type TransactionInsert } from "@sdk/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/** Most recent transactions, newest first. */
export const useTransactions = (userId: string, limit = 50) => {
  return useQuery({
    queryKey: ["transactions", userId, "recent", limit],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await dbClient
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
};

/**
 * Transactions dated on/after `fromDateKey` ("YYYY-MM-DD"). Used by the
 * dashboard analytics so period switching never refetches.
 */
export const useTransactionsSince = (userId: string, fromDateKey: string) => {
  return useQuery({
    queryKey: ["transactions", userId, "since", fromDateKey],
    enabled: !!userId && !!fromDateKey,
    queryFn: async () => {
      const { data, error } = await dbClient
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .gte("transaction_date", fromDateKey)
        .order("transaction_date", { ascending: false })
        .limit(5000);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useTransaction = (userId: string, transactionId: string | null) => {
  return useQuery({
    queryKey: ["transactions", userId, "one", transactionId],
    enabled: !!userId && !!transactionId,
    queryFn: async () => {
      const { data, error } = await dbClient
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("id", transactionId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
};

export type TransactionPayload = Omit<TransactionInsert, "user_id">;

export const useCreateTransaction = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: TransactionPayload) => {
      const { data, error } = await dbClient
        .from("transactions")
        .insert({ ...transaction, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
    },
  });
};

export const useUpdateTransaction = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: Partial<TransactionPayload> & { id: string }) => {
      const { id, ...rest } = transaction;
      const { data, error } = await dbClient
        .from("transactions")
        .update(rest)
        .eq("user_id", userId)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
    },
  });
};

export const useDeleteTransaction = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { data, error } = await dbClient
        .from("transactions")
        .delete()
        .eq("user_id", userId)
        .eq("id", transactionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", userId] });
    },
  });
};

/** One-off fetch of every transaction (for exports). Not a hook. */
export async function fetchAllTransactions(userId: string) {
  const { data, error } = await dbClient
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .limit(10000);
  if (error) throw error;
  return data ?? [];
}
