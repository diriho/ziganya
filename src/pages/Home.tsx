import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { consumeAuthRedirectError, consumePostAuthRedirect, useAuth } from "@sdk/auth";
import { CallToAction, Features, Footer, Hero, HowItWorks, Nav } from "@/components/Landing";
import { AuthModal } from "@/components/Auth";

interface LocationState {
  from?: string | null;
  authError?: string | null;
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { session, isLoading } = useAuth();
  const state = (location.state as LocationState | null) ?? null;

  // An OAuth error can arrive via router state (from /auth/callback) or directly in the
  // URL when Supabase falls back to the Site URL instead of our callback route.
  const [authError, setAuthError] = useState<string | null>(() => state?.authError ?? consumeAuthRedirectError());
  const [authOpen, setAuthOpen] = useState(() => params.get("login") === "1" || !!state?.authError || !!authError);

  const destination = state?.from || "/dashboard";

  // If we came back from Google already signed in (Site URL fallback), continue to the app.
  useEffect(() => {
    if (isLoading || !session) return;
    const pending = consumePostAuthRedirect();
    if (pending) navigate(pending, { replace: true });
  }, [isLoading, session, navigate]);

  const getStarted = () => {
    if (session) navigate(destination);
    else setAuthOpen(true);
  };

  const onAuthed = () => {
    setAuthOpen(false);
    navigate(destination);
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Nav onSignIn={() => setAuthOpen(true)} />
      <main className="flex-1">
        <Hero onGetStarted={getStarted} isAuthed={!!session} />
        <HowItWorks />
        <Features />
        <CallToAction onGetStarted={getStarted} isAuthed={!!session} />
      </main>
      <Footer />
      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setAuthError(null);
        }}
        onSuccess={onAuthed}
        initialError={authError}
        destination={destination}
      />
    </div>
  );
}
