import { dbClient, type UploadInsert } from "@sdk/db";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useUploads = (userId: string) => {
  return useQuery({
    queryKey: ["uploads", userId],
    queryFn: async () => {
      const { data, error } = await dbClient
        .from("uploads")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useUpload = (userId: string, uploadId: string | null) => {
  return useQuery({
    queryKey: ["uploads", userId, uploadId],
    queryFn: async () => {
      if (!uploadId) return null;
      const { data, error } = await dbClient
        .from("uploads")
        .select("*")
        .eq("user_id", userId)
        .eq("id", uploadId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!uploadId,
  });
};

export const useCreateUpload = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (upload: Omit<UploadInsert, "user_id">) => {
      const { data, error } = await dbClient
        .from("uploads")
        .insert({ ...upload, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads", userId] });
    },
  });
};

export const useUpdateUpload = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (upload: Partial<Omit<UploadInsert, "user_id">> & { id: string }) => {
      const { id, ...rest } = upload;
      const { data, error } = await dbClient
        .from("uploads")
        .update(rest)
        .eq("user_id", userId)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads", userId] });
    },
  });
};

export const useDeleteUpload = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (uploadId: string) => {
      const { data, error } = await dbClient
        .from("uploads")
        .delete()
        .eq("user_id", userId)
        .eq("id", uploadId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["uploads", userId] });
    },
  });
};
