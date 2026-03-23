import { useEffect, useState } from "react";
import { dbClient, type UserUpdate } from "@sdk/db";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface CurrentUserProfile {
  username: string;
  email: string;
  userID: string;
  lastSignedID: string;
}

const buildCurrentUserProfile = (
  session: Awaited<ReturnType<typeof dbClient.auth.getSession>>["data"]["session"]
): CurrentUserProfile | null => {
  if (!session?.user) {
    return null;
  }

  return {
    username:
      session.user.user_metadata?.full_name?.split(" ")?.[0] ??
      session.user.user_metadata?.username ??
      session.user.email?.split("@")[0] ??
      "User",
    email: session.user.email ?? "",
    userID: session.user.id ?? "",
    lastSignedID: session.user.last_sign_in_at ?? "",
  };
};

export const useCurrentUser = () => {
  const [user, setUser] = useState<CurrentUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const syncUser = async () => {
      const {
        data: { session },
      } = await dbClient.auth.getSession();

      if (!isMounted) {
        return;
      }

      setUser(buildCurrentUserProfile(session));
      setIsLoading(false);
    };

    void syncUser();

    const {
      data: { subscription },
    } = dbClient.auth.onAuthStateChange((_event, session) => {
      setUser(buildCurrentUserProfile(session));
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
};


export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const { data, error } = await dbClient
        .from("users")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
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
      const { data, error } = await dbClient
        .from('users')
        .upsert({ ...payload, user_id: userId }, { onConflict: "user_id" })
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