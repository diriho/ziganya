import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { consumeAuthRedirectError, consumePostAuthRedirect, getAuthInitError, useAuth } from "@sdk/auth";
import { LogoMark } from "@/components/Logo";

/**
 * Landing spot for the OAuth round-trip. The Supabase client exchanges the code
 * while the app boots; this page surfaces any error and forwards the user to
 * where they were heading.
 */
export function AuthCallbackPage() {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const handled = useRef(false);
  const [message, setMessage] = useState("Completing sign-in…");

  useEffect(() => {
    if (handled.current || isLoading) return;

    const finish = async () => {
      // 1) Provider/SupaBase sent us back with an explicit error.
      const urlError = consumeAuthRedirectError();
      if (urlError) {
        handled.current = true;
        navigate("/", { replace: true, state: { authError: urlError, from: consumePostAuthRedirect() } });
        return;
      }
      // 2) Session is ready → go where the user was heading.
      if (session) {
        handled.current = true;
        navigate(consumePostAuthRedirect() ?? "/dashboard", { replace: true });
        return;
      }
      // 3) No session: ask the client why the code exchange failed.
      handled.current = true;
      setMessage("Almost there…");
      const initError = await getAuthInitError();
      navigate("/", {
        replace: true,
        state: { authError: initError ?? "We couldn't complete sign-in. Please try again.", from: consumePostAuthRedirect() },
      });
    };

    void finish();
  }, [isLoading, session, navigate]);

  return (
    <main className="grid min-h-screen place-items-center bg-bg" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <LogoMark size={48} />
        <Loader2 className="animate-spin text-brand" size={24} aria-hidden />
        <p className="text-sm font-medium text-muted">{message}</p>
      </div>
    </main>
  );
}
