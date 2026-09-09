import { dbClient, type SubscriptionInsert } from "@sdk/db";

export type SubscriptionPayload = Omit<SubscriptionInsert, "user_id">;
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useSubscriptions = (userId: string, limit?: number) => {
  return useQuery({
    queryKey: ["subscriptions", userId, "list", limit],
    enabled: !!userId,
    queryFn: async () => {
      const rowLimit = typeof limit === "number" ? limit : 100;
      const { data, error } = await dbClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .order("next_billing_date", { ascending: true, nullsFirst: false })
        .limit(rowLimit);
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useSubscription = (
  userId: string,
  subscriptionId: string | null
) => {
  return useQuery({
    queryKey: ["subscriptions", userId, "one", subscriptionId],
    enabled: !!userId && !!subscriptionId,
    queryFn: async () => {
      const { data, error } = await dbClient
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("id", subscriptionId!)
        .single();
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateSubscription = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subscription: SubscriptionPayload) => {
      const { data, error } = await dbClient
        .from("subscriptions")
        .insert({ ...subscription, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", userId] });
    },
  });
};

export const useUpdateSubscription = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subscription: Partial<SubscriptionPayload> & { id: string }) => {
      const { id, ...rest } = subscription;
      const { data, error } = await dbClient
        .from("subscriptions")
        .update(rest)
        .eq("user_id", userId)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", userId] });
    },
  });
};

export const useDeleteSubscription = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { data, error } = await dbClient
        .from("subscriptions")
        .delete()
        .eq("user_id", userId)
        .eq("id", subscriptionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions", userId] });
    },
  });
};
