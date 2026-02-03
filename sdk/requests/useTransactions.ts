import { dbClient, type TransactionInsert } from "@sdk/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useTransactions = (userId: string, limit = 50) => {
  return useQuery({
    queryKey: ["transactions", userId, limit],
    queryFn: async () => {
      const { data, error } = await dbClient
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("transaction_date", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useTransaction = (userId: string, transactionId: string | null) => {
  return useQuery({
    queryKey: ["transactions", userId, transactionId],
    queryFn: async () => {
      if (!transactionId) return null;
      const { data, error } = await dbClient
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("id", transactionId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!transactionId,
  });
};

export const useCreateTransaction = (userId: string) => {
  return useMutation({
    mutationFn: async (transaction: Omit<TransactionInsert, "user_id">) => {
      const { data, error } = await dbClient
        .from("transactions")
        .insert({ ...transaction, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateTransaction = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      transaction: Partial<Omit<TransactionInsert, "user_id">> & { id: string }
    ) => {
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
