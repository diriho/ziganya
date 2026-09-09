import type { ReactNode } from "react";
import { cn } from "@/components/ui";

export function SettingsSection({ id, title, description, children, tone = "default" }: { id?: string; title: string; description: string; children: ReactNode; tone?: "default" | "danger" }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10">
      <div>
        <h2 id={id ? `${id}-title` : undefined} className={cn("text-lg font-bold", tone === "danger" && "text-danger")}>
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className={cn("card p-5 sm:p-6", tone === "danger" && "border-danger/30")}>{children}</div>
    </section>
  );
}
