import {dbClient} from "@sdk/db";

export async function signInWithGoogle() {
  try {
    const { error } = await dbClient.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
    // Supabase will redirect the user
  } catch (err) {
    return {
      message: "Google sign-in failed",
      error: err,
      timestamp: new Date().toISOString()

    }
  }
}

export async function signOutUser() {
  try {
    const { error } = await dbClient.auth.signOut();
    if (error) throw error;
  } catch (err) {
    return {
      message: "Sign-out failed",
      error: err,
      timestamp: new Date().toISOString()
    };
  }
}
