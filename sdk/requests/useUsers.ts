import { dbClient, type UserUpdate } from "@sdk/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// The session-backed hooks live in the auth module; re-exported here for compatibility.
export { useCurrentUser, useAuth, type CurrentUserProfile } from "../auth";

/** The application `users` row (balance, savings goal, display name). */
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await dbClient.from("users").select("*").eq("user_id", userId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

/**
 * Update the current user's row. Always scoped to `userId`; the payload cannot
 * change ownership. Upserts so a missing row is created on first save.
 */
export const useUserUpdate = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["users_update", userId],
    mutationFn: async (payload: Omit<UserUpdate, "user_id" | "id">) => {
      const { data, error } = await dbClient
        .from("users")
        .upsert({ ...payload, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: "user_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });
};
