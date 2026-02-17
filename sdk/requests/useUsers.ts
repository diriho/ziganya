import { dbClient, type UserUpdate } from "@sdk/db";
import { useMutation, useQuery,useQueryClient } from "@tanstack/react-query";


export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data, error } = await dbClient
        .from("users")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
};

export const useUsers = () =>{
    return useQuery({
        queryKey: ['fetch_users'],
        queryFn: async () =>{
            const {data,error} = await dbClient
                .from('users')
                .select("*")
            if (error) throw error;
            console.log("The db user:", data)
            return data ?? []
        }
    })
}

/**
 * useUserUpdate - Updates a user by their userId.
 * @param userId string - the user's unique id to update
 * @returns mutation hook for updating the user
 *
 * Usage:
 *   const updateUser = useUserUpdate(userId)
 *   updateUser.mutate({ name: "New Name", email: "new@somemail.com" })
 */
export const useUserUpdate = (userId: string) => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationKey: ['users_update', userId],
        mutationFn: async (payload: UserUpdate) => {
            // update user by user_id using the payload
            const { data, error } = await dbClient
                .from('users')
                .update(payload)
                .eq("user_id", userId)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", userId] });
          },
    });
}

// add create and delete