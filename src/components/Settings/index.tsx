import { PageHeader } from "@/components/ui";
import { ProfileSection } from "./sections/ProfileSection";
import { FinancesSection } from "./sections/FinancesSection";
import { AppearanceSection } from "./sections/AppearanceSection";
import { ReceiptsSection } from "./sections/ReceiptsSection";
import { DataSection } from "./sections/DataSection";
import { DangerSection } from "./sections/DangerSection";

export function SettingsView() {
  return (
    <div className="space-y-10">
      <PageHeader eyebrow="Account" title="Settings" description="Your profile, headline figures, appearance, and data." />
      <ProfileSection />
      <div className="divider" />
      <FinancesSection />
      <div className="divider" />
      <AppearanceSection />
      <div className="divider" />
      <ReceiptsSection />
      <div className="divider" />
      <DataSection />
      <div className="divider" />
      <DangerSection />
    </div>
  );
}
