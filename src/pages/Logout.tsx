import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { signOut } from "@sdk/auth";
import { LinkButton } from "@/components/ui";
import { LogoMark } from "@/components/Logo";

export function LogoutPage() {
  const started = useRef(false);
  const [state, setState] = useState<"working" | "done" | "error">("working");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    signOut().then(({ error }) => {
      if (error) {
        setMessage(error);
        setState("error");
      } else {
        setState("done");
      }
    });
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="flex justify-center">
          <LogoMark size={44} />
        </div>
        {state === "working" ? (
          <>
            <Loader2 className="mx-auto mt-6 animate-spin text-brand" size={28} aria-hidden />
            <h1 className="mt-4 text-xl font-bold">Signing you out…</h1>
          </>
        ) : state === "done" ? (
          <>
            <span className="mx-auto mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-good-soft text-good">
              <CheckCircle2 size={24} />
            </span>
            <h1 className="mt-4 text-xl font-bold">You're signed out</h1>
            <p className="mt-1.5 text-sm text-muted">Thanks for using Ziganya. Come back anytime.</p>
          </>
        ) : (
          <>
            <h1 className="mt-6 text-xl font-bold">We couldn't sign you out</h1>
            <p className="mt-1.5 text-sm text-danger">{message}</p>
          </>
        )}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <LinkButton to="/" variant="secondary">
            Back to home
          </LinkButton>
          <LinkButton to="/?login=1">Sign in again</LinkButton>
        </div>
      </div>
    </main>
  );
}
