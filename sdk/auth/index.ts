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
  const status = typeof err === "object" && err !== null && "status" in err ? Number((err as { status?: unknown }).status) : undefined;
  const m = raw.toLowerCase();

  const isGatewayTimeout =
    status === 504 || status === 502 || status === 503 || m.includes("gateway time-out") || m.includes("gateway timeout") || m.includes("upstream request timeout");
  if (isGatewayTimeout) {
    // A 5xx from Supabase's own gateway (Kong) in front of Auth — almost always Supabase's
    // infrastructure, not this account. Don't guess a specific cause (e.g. email delivery);
    // point at their status page and the one self-serve fix that resolves most of these.
    return "Supabase's authentication service isn't responding right now — this is on Supabase's side, not your account. Check https://status.supabase.com/, and if your project is listed as affected, restart it from Project Settings → General → Restart project in the Supabase dashboard, then try again.";
  }
  if (!m) return status ? `${fallback} (HTTP ${status})` : fallback;
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email address before signing in.";
  if (m.includes("user already registered")) return "An account with this email already exists. Sign in instead.";
  if (m.includes("password should be at least")) return "Password must be at least 6 characters.";
  if (m.includes("unable to validate email") || m.includes("invalid email")) return "Enter a valid email address.";
  if (m.includes("rate limit") || m.includes("too many requests")) return "Too many attempts. Please wait a moment and try again.";
  if (m.includes("error sending confirmation") || m.includes("error sending") || m.includes("smtp")) {
    return "Your account may have been created, but the confirmation email couldn't be sent. Check your inbox, or ask the project owner to check Supabase → Authentication → Emails / SMTP.";
  }
  if (m.includes("signups not allowed") || m.includes("signup is disabled")) return "New sign-ups are disabled for this project.";
  if (m.includes("provider is not enabled") || m.includes("unsupported provider")) {
    return "Google sign-in isn't enabled for this project yet. Enable the Google provider in Supabase → Authentication → Providers.";
  }
  if (m.includes("access_denied") || m.includes("access denied") || m.includes("user cancelled") || m.includes("consent")) return "Google sign-in was cancelled.";
  if (m.includes("code verifier") || m.includes("invalid request: both auth code") || m.includes("pkce")) {
    return "That sign-in link expired or was opened in a different browser. Please start Google sign-in again from here.";
  }
  if (m.includes("redirect") && m.includes("not allowed")) return "This site isn't in the project's allowed redirect URLs. Add it in Supabase → Authentication → URL Configuration.";
  if (m.includes("failed to fetch") || m.includes("network")) return "Network error. Check your connection and try again.";
  return raw;
}

/* ------------------------------------------------------------------ */
/* OAuth redirect plumbing                                               */
/* ------------------------------------------------------------------ */

/** Where the browser returns after Google; must be allow-listed in Supabase URL Configuration. */
export const OAUTH_CALLBACK_PATH = "/auth/callback";
const POST_AUTH_REDIRECT_KEY = "ziganya:post-auth-redirect";

/** Remember where to send the user once OAuth completes (survives the round-trip to Google). */
export function setPostAuthRedirect(path: string): void {
  try {
    sessionStorage.setItem(POST_AUTH_REDIRECT_KEY, path.startsWith("/") ? path : "/dashboard");
  } catch {
    /* ignore */
  }
}

export function consumePostAuthRedirect(): string | null {
  try {
    const v = sessionStorage.getItem(POST_AUTH_REDIRECT_KEY);
    if (v) sessionStorage.removeItem(POST_AUTH_REDIRECT_KEY);
    return v;
  } catch {
    return null;
  }
}

/**
 * Read an OAuth error returned in the URL (query or hash), remove it from the
 * address bar, and return a friendly message. Supabase's client swallows these
 * during initialization, so the app has to look for them itself.
 */
export function consumeAuthRedirectError(): string | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.startsWith("#") ? url.hash.slice(1) : url.hash);
  const pick = (k: string) => url.searchParams.get(k) ?? hash.get(k);
  const error = pick("error");
  const description = pick("error_description");
  const code = pick("error_code");
  if (!error && !description && !code) return null;

  for (const k of ["error", "error_description", "error_code"]) {
    url.searchParams.delete(k);
    hash.delete(k);
  }
  const rest = hash.toString();
  url.hash = rest ? `#${rest}` : "";
  window.history.replaceState(window.history.state, "", url.toString());

  const message = (description ?? error ?? code ?? "").replace(/\+/g, " ");
  return friendlyAuthError(new Error(message), "Google sign-in failed.");
}

/**
 * The Supabase client exchanges the PKCE `?code=` while initializing and keeps
 * any failure to itself. `initialize()` is idempotent and returns that result.
 */
export async function getAuthInitError(): Promise<string | null> {
  try {
    const { error } = await dbClient.auth.initialize();
    return error ? friendlyAuthError(error, "We couldn't complete sign-in.") : null;
  } catch (err) {
    return friendlyAuthError(err, "We couldn't complete sign-in.");
  }
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

export async function signInWithGoogle(destination = "/dashboard"): Promise<{ error: string | null }> {
  try {
    setPostAuthRedirect(destination);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}${OAUTH_CALLBACK_PATH}` : undefined;
    const { error } = await dbClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        // Always show the account chooser; avoids silently reusing the wrong Google account.
        queryParams: { prompt: "select_account" },
      },
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
