import { dbClient, type MerchantInsert } from "@sdk/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/** Merchants are shared reference data (no user_id). */
export const useMerchants = () => {
  return useQuery({
    queryKey: ["merchants"],
    queryFn: async () => {
      const { data, error } = await dbClient
        .from("merchants")
        .select("*")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useMerchant = (merchantId: string | null) => {
  return useQuery({
    queryKey: ["merchants", merchantId],
    queryFn: async () => {
      if (!merchantId) return null;
      const { data, error } = await dbClient
        .from("merchants")
        .select("*")
        .eq("id", merchantId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!merchantId,
  });
};

export const useCreateMerchant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (merchant: MerchantInsert) => {
      const { data, error } = await dbClient
        .from("merchants")
        .insert(merchant)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
    },
  });
};

export const useUpdateMerchant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (merchant: Partial<MerchantInsert> & { id: string }) => {
      const { id, ...rest } = merchant;
      const { data, error } = await dbClient
        .from("merchants")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
    },
  });
};

export const useDeleteMerchant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (merchantId: string) => {
      const { data, error } = await dbClient
        .from("merchants")
        .delete()
        .eq("id", merchantId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchants"] });
    },
  });
};
