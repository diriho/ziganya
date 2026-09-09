import { useState } from "react";
import { useNavigate } from "react-router";
import { deleteAccount } from "@sdk/auth";
import { Button, FormField, Input, Modal, useToast } from "@/components/ui";
import { SettingsSection } from "../SettingsSection";

const CONFIRM_WORD = "DELETE";

export function DangerSection() {
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    if (busy) return;
    setOpen(false);
    setTyped("");
    setError(null);
  };

  const confirm = async () => {
    setBusy(true);
    setError(null);
    const result = await deleteAccount();
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    toast.success("Account data deleted", "You've been signed out.");
    navigate("/", { replace: true });
  };

  return (
    <SettingsSection id="danger" tone="danger" title="Delete account" description="Permanently remove your Ziganya data. This cannot be undone.">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          Deletes all transactions, subscriptions, budgets, uploaded receipts and your profile, then signs you out.
        </p>
        <Button variant="danger" onClick={() => setOpen(true)}>
          Delete account
        </Button>
      </div>

      <Modal
        open={open}
        onClose={close}
        size="sm"
        locked={busy}
        title="Delete your account?"
        description="This removes every piece of data you've added to Ziganya."
        footer={
          <>
            <Button variant="secondary" onClick={close} disabled={busy}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirm} loading={busy} disabled={typed.trim() !== CONFIRM_WORD}>
              Permanently delete
            </Button>
          </>
        }
      >
        <FormField label={`Type ${CONFIRM_WORD} to confirm`} htmlFor="delete-confirm" error={error}>
          <Input id="delete-confirm" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={CONFIRM_WORD} autoComplete="off" spellCheck={false} />
        </FormField>
      </Modal>
    </SettingsSection>
  );
}
