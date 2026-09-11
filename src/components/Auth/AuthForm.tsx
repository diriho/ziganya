import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, Mail, MailCheck, User } from "lucide-react";
import { registerWithEmail, signInWithEmail, signInWithGoogle } from "@sdk/auth";
import { Button, FormField, Input, Segmented } from "@/components/ui";
import { GoogleIcon } from "./GoogleIcon";

type Mode = "signin" | "signup";

export function AuthForm({
  onSuccess,
  initialMode = "signin",
  initialError = null,
  destination = "/dashboard",
}: {
  onSuccess: () => void;
  initialMode?: Mode;
  initialError?: string | null;
  destination?: string;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [confirmSent, setConfirmSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy("email");
    const result = mode === "signin" ? await signInWithEmail(email.trim(), password) : await registerWithEmail(email.trim(), password, name.trim() || undefined);
    setBusy(null);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setConfirmSent(true);
      return;
    }
    onSuccess();
  };

  const google = async () => {
    setError(null);
    setBusy("google");
    const { error } = await signInWithGoogle(destination);
    // On success the browser redirects; only errors return here.
    if (error) {
      setError(error);
      setBusy(null);
    }
  };

  if (confirmSent) {
    return (
      <div className="py-2 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
          <MailCheck size={26} />
        </span>
        <h3 className="mt-4 text-lg font-bold">Check your inbox</h3>
        <p className="mt-1.5 text-sm text-muted">
          We sent a confirmation link to <span className="font-semibold text-ink">{email}</span>. Open it to activate your account, then sign in.
        </p>
        <Button variant="secondary" className="mt-6" onClick={() => { setConfirmSent(false); setMode("signin"); }}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Segmented<Mode>
        ariaLabel="Authentication mode"
        value={mode}
        onChange={(m) => { setMode(m); setError(null); }}
        className="w-full [&>button]:flex-1"
        options={[
          { value: "signin", label: "Sign in" },
          { value: "signup", label: "Create account" },
        ]}
      />

      <Button variant="secondary" className="w-full" size="lg" onClick={google} loading={busy === "google"} disabled={busy === "email"} leftIcon={<GoogleIcon />}>
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
        {mode === "signup" && (
          <FormField label="Full name" htmlFor="auth-name">
            <Input id="auth-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" leftAdornment={<User size={16} />} />
          </FormField>
        )}
        <FormField label="Email" htmlFor="auth-email" required>
          <Input id="auth-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required leftAdornment={<Mail size={16} />} />
        </FormField>
        <FormField label="Password" htmlFor="auth-password" required hint={mode === "signup" ? "At least 6 characters." : undefined}>
          <Input
            id="auth-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            required
            minLength={6}
            leftAdornment={<Lock size={16} />}
            rightAdornment={
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-ink" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
        </FormField>

        {error && (
          <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" loading={busy === "email"} disabled={busy === "google"}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted">
        {mode === "signin" ? "New here? " : "Already have an account? "}
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-semibold text-brand hover:underline">
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
