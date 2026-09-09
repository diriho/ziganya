import type { ReactNode } from "react";
import { cn } from "./cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
  tone?: "default" | "danger";
}

export function EmptyState({ icon, title, description, action, compact, className, tone = "default" }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "px-4 py-8" : "px-6 py-14",
        className
      )}
      role={tone === "danger" ? "alert" : undefined}
    >
      {icon && (
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
            tone === "danger" ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand"
          )}
        >
          {icon}
        </div>
      )}
      <h4 className="text-base font-bold">{title}</h4>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted text-balance">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
