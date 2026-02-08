import { useState } from "react";
import SettingsSection from "../settinSection/index";

export default function DeleteAcc() {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleAction = () => {
    if (isConfirming) {
      // TODO: wire up destructive account deletion when backend is ready
      setIsConfirming(false);
    } else {
      setIsConfirming(true);
    }
  };

  return (
    <SettingsSection
      title="Delete account"
      description="Permanently remove your Ziganya account and all associated data."
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50/50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="font-medium text-red-800">This action cannot be undone.</p>
          <p className="text-sm text-red-700/90">
            Deleting your account will remove all budgets, subscriptions, and
            transaction history.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAction}
          className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isConfirming
              ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              : "border-2 border-red-200 bg-white text-red-600 hover:bg-red-50 focus:ring-red-400"
          }`}
        >
          {isConfirming ? "Confirm delete" : "Delete account"}
        </button>
      </div>
    </SettingsSection>
  );
}
