import SettingsSection from "../settinSection/index";
import { Shield } from "lucide-react";

export default function Security() {
  return (
    <SettingsSection
      title="Security"
      description="Manage your password and account security."
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-light/20 text-brand-green">
            <Shield size={20} />
          </div>
          <div>
            <p className="font-medium text-zinc-900">Two-factor authentication</p>
            <p className="text-sm text-zinc-500">
              Add an extra layer of security to your account.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-brand-green transition-colors hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
        >
          Enable
        </button>
      </div>
    </SettingsSection>
  );
}
