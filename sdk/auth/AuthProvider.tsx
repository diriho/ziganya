import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { dbClient } from "../db";
import { buildCurrentUserProfile, ensureUserRow, signOut } from "./index";
import { AuthContext, type AuthContextValue } from "./context";

/** Subscribes to the Supabase session once and exposes it to the whole app. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    dbClient.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setIsLoading(false);
      })
      .catch(() => {
        if (mounted) setIsLoading(false);
      });

    const {
      data: { subscription },
    } = dbClient.auth.onAuthStateChange((_event, next) => {
      if (!mounted) return;
      setSession(next);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Keep the `users` row in sync once per signed-in user (covers Google sign-in too).
  useEffect(() => {
    const u = session?.user;
    if (!u || syncedUserId.current === u.id) return;
    syncedUserId.current = u.id;
    void ensureUserRow(u);
  }, [session]);

  const doSignOut = useCallback(() => signOut(), []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, user: buildCurrentUserProfile(session), isLoading, signOut: doSignOut }),
    [session, isLoading, doSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
