import { useState, type FormEvent } from "react";
import { useAuth } from "@sdk/auth";
import { useUser, useUserUpdate } from "@sdk/requests";
import { Avatar, Badge, Button, FormField, Input, Skeleton, useToast } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { SettingsSection } from "../SettingsSection";

export function ProfileSection() {
  const { user } = useAuth();
  const userId = user?.userID ?? "";
  const { data: row, isLoading } = useUser(userId);
  const update = useUserUpdate(userId);
  const toast = useToast();
  const [name, setName] = useState<string | null>(null);

  const currentName = row?.username ?? user?.fullName ?? "";
  const value = name ?? currentName;
  const dirty = value.trim() !== currentName.trim();

  const save = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({ username: value.trim() || null, email: user?.email ?? null });
      toast.success("Profile saved");
      setName(null);
    } catch (err) {
      toast.error("Could not save profile", err instanceof Error ? err.message : undefined);
    }
  };

  return (
    <SettingsSection id="profile" title="Profile" description="How you appear across Ziganya.">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      ) : (
        <form onSubmit={save} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={value || user?.email} src={user?.avatarUrl} size="xl" />
            <div className="min-w-0">
              <p className="truncate text-base font-bold">{value || "Unnamed"}</p>
              <p className="truncate text-sm text-muted">{user?.email}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <Badge tone="brand" size="sm">
                  {user?.provider === "google" ? "Google account" : "Email account"}
                </Badge>
              </div>
            </div>
          </div>

          <FormField label="Display name" htmlFor="profile-name" hint="Used in greetings and exports.">
            <Input id="profile-name" value={value} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={80} />
          </FormField>

          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-surface-2 px-4 py-3">
              <dt className="text-xs font-medium text-muted">Member since</dt>
              <dd className="mt-0.5 font-semibold">{formatDate(user?.createdAt)}</dd>
            </div>
            <div className="rounded-xl bg-surface-2 px-4 py-3">
              <dt className="text-xs font-medium text-muted">Last sign-in</dt>
              <dd className="mt-0.5 font-semibold">{formatDate(user?.lastSignedIn, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</dd>
            </div>
          </dl>

          <div className="flex justify-end gap-2">
            {dirty && (
              <Button type="button" variant="secondary" onClick={() => setName(null)} disabled={update.isPending}>
                Reset
              </Button>
            )}
            <Button type="submit" disabled={!dirty} loading={update.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      )}
    </SettingsSection>
  );
}
