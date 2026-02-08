import { useState, useEffect } from "react";
import SettingsSection from "../settinSection/index";
import { Moon, Sun } from "lucide-react";

export default function ThemeMode() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as "light" | "dark" | null;
      if (saved) return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <SettingsSection
      title="Appearance"
      description="Customize the look of the application."
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green-light/20 text-brand-green">
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
          </div>
          <div>
            <p className="font-medium text-zinc-900">Theme</p>
            <p className="text-sm text-zinc-500">
              Switch between light and dark mode.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          role="switch"
          aria-checked={theme === "dark"}
          className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 ${
            theme === "dark" ? "bg-brand-green" : "bg-zinc-200"
          }`}
        >
          <span
            className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              theme === "dark" ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
    </SettingsSection>
  );
}
