import React from "react";
import SettingsSection from "../settinSection/index";
import { formatDate } from "@/lib/format";
import { useCurrentUser, useUser, useUserUpdate } from "@sdk/requests";
import { useState } from "react";

export default function Profile() {
  const { user: currentUser, isLoading: currentUserLoading } = useCurrentUser();
  const { data: user, isLoading, error } =  useUser(currentUser?.userID ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const updateUserMutation = useUserUpdate(currentUser?.userID ?? "");
 
  const handleSave = (e:React.MouseEvent<HTMLButtonElement>) =>{
    e.preventDefault();
    updateUserMutation.mutate({
      username:username.trim() || null,
      email: email.trim() || null
    });
  };


  if (error) return <div className="text-red-900">Error loading profile: {error.message}</div>;
  if (currentUserLoading || isLoading) return <div>Loading user info…</div>;
  if (!currentUser?.userID) {
    return (
      <SettingsSection title="Profile" description="Update your personal details and how others see you.">
        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm text-center text-zinc-500">
          Sign in to view and edit your profile.
        </div>
      </SettingsSection>
    );
  }
  if (!user) {
    return (
      <SettingsSection title="Profile" description="Update your personal details and how others see you.">
        <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm text-center text-zinc-500">
          No profile found. Create your profile to get started.
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection
      title="Profile"
      description="Update your personal details and how others see you."
    >
      <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4">
            <div>
              <p className="font-semibold text-zinc-900 uppercase">{user?.username ?? "—"}</p>
              <p className="text-sm text-zinc-500">Member since {formatDate(user?.created_at)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="profile-name"
              className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
            >
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="profile-email"
              className="block text-xs font-medium uppercase tracking-wider text-zinc-500"
            >
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            className="rounded-xl bg-brand-green px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2"
            onClick={handleSave}
            disabled={updateUserMutation.isPending}
          >
            {updateUserMutation.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </SettingsSection>
  );
}
