import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@sdk/auth";
import { CallToAction, Features, Footer, Hero, HowItWorks, Nav } from "@/components/Landing";
import { AuthModal } from "@/components/Auth";

interface LocationState {
  from?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { session } = useAuth();
  const [authOpen, setAuthOpen] = useState(() => params.get("login") === "1");

  const destination = (location.state as LocationState | null)?.from || "/dashboard";

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
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={onAuthed} />
    </div>
  );
}
