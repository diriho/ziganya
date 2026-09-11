import { Modal } from "@/components/ui";
import { LogoMark } from "@/components/Logo";
import { AuthForm } from "./AuthForm";

export function AuthModal({
  open,
  onClose,
  onSuccess,
  initialError = null,
  destination = "/dashboard",
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Message to show immediately (e.g. an OAuth error returned in the URL). */
  initialError?: string | null;
  /** Where OAuth should land after completing. */
  destination?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="mb-6 flex flex-col items-center text-center">
        <LogoMark size={44} />
        <h2 className="mt-4 text-xl font-bold">Welcome to Ziganya</h2>
        <p className="mt-1 text-sm text-muted">Sign in to see your dashboard.</p>
      </div>
      {open && <AuthForm onSuccess={onSuccess} initialError={initialError} destination={destination} />}
    </Modal>
  );
}
