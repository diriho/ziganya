import ThemeMode from './children/themeMode';
import Profile from './children/profile';
import Security from './children/security';
import DeleteAccount from './children/deleteAcc';

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-1 max-w-5xl mx-auto bg-amber-25">
      <h1 className="text-4xl font-bold text-[#063b1e]">Settings</h1>
      <p className="text-zinc-500 dark:text-zinc-400 font-medium mb-8">Manage your account preferences and application settings.</p>

      <div className="space-y-6">
        {/* Appearance Section */}
        <ThemeMode />
    
        {/* Profile Section */}
        <Profile />
            
        {/* Security Section */}
        <Security />

        {/* Delete Account  */}
        <DeleteAccount />
      </div>
    </div>
  );
}
