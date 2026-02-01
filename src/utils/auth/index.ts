import supabase from "../../supabase/supabaseConfig";

export async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (err) {
    return {
      message: "Sign-out failed",
      error: err,
      timestamp: new Date().toISOString()
    };
  }
}
