import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";
import type { CurrentUserProfile } from "./index";

export interface AuthContextValue {
  session: Session | null;
  user: CurrentUserProfile | null;
  isLoading: boolean;
  signOut: () => Promise<{ error: string | null }>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Backwards-compatible hook: `{ user, isLoading }`. */
export function useCurrentUser(): { user: CurrentUserProfile | null; isLoading: boolean } {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}
