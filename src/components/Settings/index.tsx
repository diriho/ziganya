import ThemeMode from "./children/themeMode";
import Profile from "./children/profile";
import DeleteAccount from "./children/deleteAcc";

export default function SettingsPage() {
  return (
    <section className="space-y-8" aria-labelledby="settings-title">
      <header>
        <h1
          id="settings-title"
          className="text-2xl font-bold tracking-tight text-zinc-900"
        >
          Settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your account preferences and application settings.
        </p>
      </header>


      <div className="space-y-8">
        <Profile />
        <ThemeMode />
        <DeleteAccount />
      </div>
    </section>
  );
}
