import React from 'react';
import SettingsSection from '../settinSection';

const DeleteAcc = () => {
  const [isConfirming, setIsConfirming] = React.useState(false);

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
      title="Delete Account"
      description="Permanently remove your Ziganya account and personal data."
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-[#0b2a17] md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="font-bold text-[#063b1e] dark:text-white">This action cannot be undone.</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Deleting your account will remove all budgets, subscriptions, and transaction history associated with
            your profile.
          </p>
        </div>
        <button
          onClick={handleAction}
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${
            isConfirming
              ? "bg-red-600 text-white hover:bg-red-700"
              : "border-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
          }`}
        >
          {isConfirming ? "Confirm Delete" : "Delete Account"}
        </button>
      </div>
    </SettingsSection>
  );
};

export default DeleteAcc;
