import { dbClient } from "@sdk/db";

export async function deleteAccount() {
  const { data: sessionData } = await dbClient.auth.getSession();

  const userId = sessionData.session?.user.id;

  if (!userId) {
    return {
      error: new Error("User not authenticated"),
      message: "You must be signed in to delete your account.",
      timestamp: new Date().toISOString(),
    };
  }

  const tables = ["transactions", "subscriptions", "budgets", "uploads", "categories", "users"] as const;

  for (const table of tables) {
    const { error } = await dbClient.from(table).delete().eq("user_id", userId);

    if (error) {
        return {
            error,
            message: error.message || `Failed to delete ${table}.`,
            timestamp: new Date().toISOString(),
        }
    }
  }

  return { success: true as const };
}