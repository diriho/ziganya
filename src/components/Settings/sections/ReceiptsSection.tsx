import { useState } from "react";
import { Check, Cpu, Sparkles, Wand2 } from "lucide-react";
import { getEnginePreference, setEnginePreference, type ReceiptEnginePreference } from "@sdk/receipts";
import { cn, useToast } from "@/components/ui";
import { SettingsSection } from "../SettingsSection";

const options: { value: ReceiptEnginePreference; label: string; description: string; icon: typeof Cpu }[] = [
  { value: "auto", label: "Automatic", description: "Use the AI reader when it's set up, otherwise read on this device.", icon: Wand2 },
  { value: "device", label: "On this device", description: "Free and private. The photo never leaves your browser. Less accurate on blurry receipts.", icon: Cpu },
  { value: "cloud", label: "AI reader", description: "Highest accuracy. Requires the extract-receipt function and an API key.", icon: Sparkles },
];

export function ReceiptsSection() {
  const [pref, setPref] = useState<ReceiptEnginePreference>(() => getEnginePreference());
  const toast = useToast();

  const choose = (value: ReceiptEnginePreference) => {
    setEnginePreference(value);
    setPref(value);
    toast.success("Receipt reader updated", options.find((o) => o.value === value)?.label);
  };

  return (
    <SettingsSection id="receipts" title="Receipt reader" description="How scanned receipts are turned into transactions. You always review before saving.">
      <div role="radiogroup" aria-label="Receipt reader" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((opt) => {
          const active = pref === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => choose(opt.value)}
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
