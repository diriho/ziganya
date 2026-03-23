import { dbClient, type BudgetInsert } from "@sdk/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// Fetch budgets for a specific user
export const useBudgets = (userId:string) =>{
    return useQuery({
        queryKey: ["budgets",userId],
    enabled: !!userId,
        queryFn: async () => {
            // now make db client call
            const {data,error} = await dbClient
                .from("budgets")
                .select("*")
                .eq("user_id",userId)
                .order("created_at",{ascending:false});
            if(error) throw error;
            return data ?? [];
        }
    })
}

// Post request
/**
 * Always sets user_id inside the mutation, ignoring whatever is in the payload. The caller cannot override it.
 * @param userId user id since this is per user access and ownership
 * @returns 
 */
export const useCreateBudget = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (budget: Omit<BudgetInsert, "user_id">) => {
      const { data, error } = await dbClient
        .from("budgets")
        .insert({ ...budget, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
    },
  });
};

// update request
export const useUpdateBudget = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (budget: Partial<Omit<BudgetInsert, "user_id">> & { id: string }) => {
      const { id, ...rest } = budget;
      const { data, error } = await dbClient
        .from("budgets")
        .update(rest)
        .eq("user_id", userId)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
    },
  });
};

export const useDeleteBudget = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (budgetId: string) => {
      const { data, error } = await dbClient
        .from("budgets")
        .delete()
        .eq("user_id", userId)
        .eq("id", budgetId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets", userId] });
    },
  });
};

