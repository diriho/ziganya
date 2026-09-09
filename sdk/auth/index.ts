/**
 * Authentication: Supabase auth wrappers plus a React provider that subscribes
 * to the session exactly once and exposes the current user to the app.
 */
import type { Session, User } from "@supabase/supabase-js";
import { dbClient } from "../db";

/* ------------------------------------------------------------------ */
/* Profile shape                                                         */
/* ------------------------------------------------------------------ */

export interface CurrentUserProfile {
  userID: string;
  email: string;
  /** First name or a sensible fallback; used for greetings. */
  username: string;
  fullName: string;
  avatarUrl: string | null;
  lastSignedIn: string;
  createdAt: string;
  provider: string;
}

export function buildCurrentUserProfile(session: Session | null): CurrentUserProfile | null {
  const u = session?.user;
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = typeof meta.full_name === "string" ? meta.full_name : typeof meta.name === "string" ? meta.name : "";
  const username =
    fullName.split(" ")[0] ||
    (typeof meta.username === "string" ? meta.username : "") ||
    u.email?.split("@")[0] ||
    "there";
  return {
    userID: u.id,
    email: u.email ?? "",
    username,
    fullName,
    avatarUrl:
      typeof meta.avatar_url === "string" ? meta.avatar_url : typeof meta.picture === "string" ? meta.picture : null,
    lastSignedIn: u.last_sign_in_at ?? "",
    createdAt: u.created_at ?? "",
    provider: u.app_metadata?.provider ?? "email",
  };
}

/* ------------------------------------------------------------------ */
/* Error mapping                                                         */
/* ------------------------------------------------------------------ */

export function friendlyAuthError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const m = raw.toLowerCase();
  if (!m) return fallback;
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email address before signing in.";
  if (m.includes("user already registered")) return "An account with this email already exists. Sign in instead.";
  if (m.includes("password should be at least")) return "Password must be at least 6 characters.";
  if (m.includes("unable to validate email") || m.includes("invalid email")) return "Enter a valid email address.";
  if (m.includes("rate limit") || m.includes("too many requests")) return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Network error. Check your connection and try again.";
  return raw;
}

/* ------------------------------------------------------------------ */
/* Users table sync                                                      */
/* ------------------------------------------------------------------ */

/**
 * Make sure a `users` row exists for this auth user. Runs for every provider
 * (Google included). Never overwrites a name the user has edited.
 */
export async function ensureUserRow(user: User): Promise<void> {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const displayName =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    user.email?.split("@")[0] ||
    null;

  const { data: existing, error: readError } = await dbClient
    .from("users")
    .select("id, username")
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) {
    console.warn("[auth] could not read users row", readError.message);
    return;
  }

  const now = new Date().toISOString();
  if (!existing) {
    const { error } = await dbClient.from("users").insert({
      user_id: user.id,
      email: user.email ?? null,
      username: displayName,
      created_at: user.created_at ?? now,
      updated_at: now,
    });
    if (error) console.warn("[auth] could not create users row", error.message);
    return;
  }

  const { error } = await dbClient
    .from("users")
    .update({
      email: user.email ?? null,
      username: existing.username ?? displayName,
      updated_at: now,
    })
    .eq("user_id", user.id);
  if (error) console.warn("[auth] could not update users row", error.message);
}

/* ------------------------------------------------------------------ */
/* Auth actions                                                          */
/* ------------------------------------------------------------------ */

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: string | null;
  /** True when sign-up succeeded but email confirmation is still required. */
  needsConfirmation?: boolean;
}

export async function signInWithGoogle(redirectPath = "/dashboard"): Promise<{ error: string | null }> {
  try {
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}${redirectPath}` : undefined;
    const { error } = await dbClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: friendlyAuthError(err, "Google sign-in failed.") };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await dbClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) await ensureUserRow(data.user);
    return { user: data.user, session: data.session, error: null };
  } catch (err) {
    return { user: null, session: null, error: friendlyAuthError(err, "Sign-in failed.") };
  }
}

export async function registerWithEmail(email: string, password: string, fullName?: string): Promise<AuthResult> {
  try {
    const { data, error } = await dbClient.auth.signUp({
      email,
      password,
      options: fullName ? { data: { full_name: fullName } } : undefined,
    });
    if (error) throw error;
    if (data.user && data.session) await ensureUserRow(data.user);
    return {
      user: data.user,
      session: data.session,
      error: null,
      needsConfirmation: !!data.user && !data.session,
    };
  } catch (err) {
    return { user: null, session: null, error: friendlyAuthError(err, "Registration failed.") };
  }
}

export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await dbClient.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: friendlyAuthError(err, "Sign-out failed.") };
  }
}

export type DeleteAccountResult = { ok: true } | { ok: false; message: string };

/**
 * Remove every user-owned row (and uploaded files) then sign out.
 * Deleting the auth user itself requires a service role, so that must be done
 * server-side; this clears all application data the client is allowed to touch.
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  const {
    data: { session },
  } = await dbClient.auth.getSession();
  const userId = session?.user.id;
  if (!userId) return { ok: false, message: "You must be signed in to delete your account." };

  // Best-effort: remove uploaded receipts from storage.
  try {
    const { data: files } = await dbClient.storage.from("receipts").list(userId, { limit: 1000 });
    if (files && files.length > 0) {
      await dbClient.storage.from("receipts").remove(files.map((f) => `${userId}/${f.name}`));
    }
  } catch {
    /* storage may not be configured; continue */
  }

  const tables = ["transactions", "subscriptions", "budgets", "uploads", "categories", "users"] as const;
  for (const table of tables) {
    const { error } = await dbClient.from(table).delete().eq("user_id", userId);
    if (error) return { ok: false, message: error.message || `Failed to delete ${table}.` };
  }

  await dbClient.auth.signOut().catch(() => undefined);
  return { ok: true };
}

export * from "./context";
export { AuthProvider } from "./AuthProvider";
