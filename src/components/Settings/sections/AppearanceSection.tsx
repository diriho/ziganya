import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "@/providers/theme";
import { cn } from "@/components/ui";
import { SettingsSection } from "../SettingsSection";

const options: { value: ThemePreference; label: string; description: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", description: "Bright surfaces, deep green accents.", icon: Sun },
  { value: "dark", label: "Dark", description: "Easy on the eyes at night.", icon: Moon },
  { value: "system", label: "System", description: "Follow your device setting.", icon: Monitor },
];

export function AppearanceSection() {
  const { preference, setPreference } = useTheme();
  return (
    <SettingsSection id="appearance" title="Appearance" description="Choose how Ziganya looks on this device.">
      <div role="radiogroup" aria-label="Theme" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((opt) => {
          const active = preference === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setPreference(opt.value)}
              className={cn(
                "relative flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                active ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong hover:bg-surface-2"
              )}
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", active ? "bg-primary text-primary-fg" : "bg-surface-2 text-ink-2")}>
                <Icon size={18} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-ink">{opt.label}</span>
                <span className="block text-xs text-muted">{opt.description}</span>
              </span>
              {active && (
                <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-fg">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
}
