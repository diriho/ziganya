import { dbClient, type CategoryInsert } from "@sdk/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/** List categories: default (user_id null) plus current user's. */
export const useCategories = (userId: string) => {
  return useQuery({
    queryKey: ["categories", userId],
    queryFn: async () => {
      const { data, error } = await dbClient
        .from("categories")
        .select("*")
        .or(`user_id.is.null,user_id.eq.${userId}`)
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useCategory = (userId: string, categoryId: string | null) => {
  return useQuery({
    queryKey: ["categories", userId, categoryId],
    queryFn: async () => {
      if (!categoryId) return null;
      const { data, error } = await dbClient
        .from("categories")
        .select("*")
        .eq("id", categoryId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      if (data?.user_id != null && data.user_id !== userId) return null;
      return data;
    },
    enabled: !!categoryId,
  });
};

/** Create a user-owned category. Always sets user_id. */
export const useCreateCategory = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: Omit<CategoryInsert, "user_id">) => {
      const { data, error } = await dbClient
        .from("categories")
        .insert({ ...category, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    },
  });
};

/** Update only if category belongs to current user (not default). */
export const useUpdateCategory = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      category: Partial<CategoryInsert> & { id: string }
    ) => {
      const { id, ...rest } = category;
      const { data, error } = await dbClient
        .from("categories")
        .update(rest)
        .eq("user_id", userId)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    },
  });
};

/** Delete only user-owned category. */
export const useDeleteCategory = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { data, error } = await dbClient
        .from("categories")
        .delete()
        .eq("user_id", userId)
        .eq("id", categoryId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    },
  });
};
