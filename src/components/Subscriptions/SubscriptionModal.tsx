import type { Subscription } from "@sdk/db";
import { useAuth } from "@sdk/auth";
import { Modal } from "@/components/ui";
import { SubscriptionForm } from "./SubscriptionForm";

export function SubscriptionModal({ open, onClose, subscription = null, defaultCurrency }: { open: boolean; onClose: () => void; subscription?: Subscription | null; defaultCurrency?: string }) {
  const { user } = useAuth();
  return (
    <Modal open={open} onClose={onClose} title={subscription ? "Edit subscription" : "Add subscription"} description={subscription ? "Update the recurring payment." : "Track a recurring payment and its next renewal."}>
      {open && <SubscriptionForm key={subscription?.id ?? "new"} userId={user?.userID ?? ""} initial={subscription} defaultCurrency={defaultCurrency} onSuccess={onClose} onCancel={onClose} />}
    </Modal>
  );
}
