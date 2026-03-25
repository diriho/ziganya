import { useState } from "react";
import { useNavigate } from "react-router";
import SettingsSection from "../settinSection/index";
import { dbClient } from "@sdk/db";
import { deleteAccount } from "../../../utils/deleteAccount/deleteAccountHandler";

export default function DeleteAcc() {
  const navigate = useNavigate();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleStartDelete = () => {
    setDeleteError("");
    setIsConfirming(true);
  };

  const handleCancel = () => {
    if (isDeleting) {
      return;
    }

    setIsConfirming(false);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteAccount();
      await dbClient.auth.signOut().catch(() => undefined);
      setIsConfirming(false);
      setIsDeleted(true);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete account. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <>
      <SettingsSection
        title="Delete account"
        description="Permanently remove your Ziganya account and all associated data."
      >
        <div className="flex flex-col gap-4 rounded-2xl border border-red-100 bg-red-50/50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="font-medium text-red-800">This action cannot be undone.</p>
            <p className="text-sm text-red-700/90">
              Deleting your account will remove all budgets, subscriptions, transactions,
              uploads, and profile data.
            </p>
          </div>
          <button
            type="button"
            onClick={handleStartDelete}
            className="shrink-0 rounded-xl border-2 border-red-200 bg-white px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            Delete account
          </button>
        </div>
      </SettingsSection>

      {isConfirming && !isDeleted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-wide text-red-600">
                Confirm deletion
              </p>
              <h3 className="text-2xl font-bold text-zinc-900">Delete your account?</h3>
              <p className="text-sm leading-6 text-zinc-600">
                This will permanently remove your profile and all user-owned data from
                Ziganya. You will not be able to recover this account.
              </p>
            </div>

            {deleteError ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {deleteError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isDeleting}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleted ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-zinc-900">
              Account deleted successfully
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              Your Ziganya account and associated data have been removed.
            </p>
            <button
              type="button"
              onClick={handleGoHome}
              className="mt-6 inline-flex rounded-xl bg-brand-green px-5 py-2.5 text-sm font-medium text-brand-green-light transition-colors hover:bg-black"
            >
              Go to home page
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
