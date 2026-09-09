import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, cn } from "@/components/ui";
import { Sparkline } from "@/components/charts";

export interface StatDelta {
  text: string;
  direction: "up" | "down" | "flat";
  /** Whether this movement is good news (colors the delta). */
  positive: boolean;
  hint?: string;
}

export interface StatTileProps {
  label: string;
  value: string;
  delta?: StatDelta;
  hint?: ReactNode;
  spark?: number[];
  /** 0..100 — renders a thin progress track. */
  progress?: number | null;
  tone?: "default" | "brand";
  icon?: ReactNode;
  className?: string;
}

export function StatTile({ label, value, delta, hint, spark, progress, tone = "default", icon, className }: StatTileProps) {
  const brand = tone === "brand";
  const DeltaIcon = delta?.direction === "up" ? ArrowUpRight : delta?.direction === "down" ? ArrowDownRight : Minus;
  const deltaColor =
    !delta || delta.direction === "flat"
      ? brand
        ? "text-white/70"
        : "text-muted"
      : delta.positive
        ? brand
          ? "text-accent"
          : "text-good"
        : brand
          ? "text-[#ffb4b4]"
          : "text-danger";

  return (
    <Card tone={brand ? "brand" : "default"} padding="md" className={cn("flex min-h-[148px] flex-col justify-between overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className={cn("text-sm font-medium", brand ? "text-white/75" : "text-muted")}>{label}</p>
        {icon && (
          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", brand ? "bg-white/10 text-accent" : "bg-brand-soft text-brand")}>
            {icon}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p className={cn("font-display text-[1.75rem] font-bold leading-none tracking-tight sm:text-3xl", brand ? "text-white" : "text-ink")}>{value}</p>
        {spark && spark.length > 1 && (
          <span className={cn("shrink-0", brand ? "text-[#0f2f1c]" : "text-surface")}>
            <Sparkline values={spark} emphasize={brand} ariaLabel="Recent trend" />
          </span>
        )}
      </div>

      {typeof progress === "number" && (
        <div className={cn("mt-3 h-1.5 w-full overflow-hidden rounded-full", brand ? "bg-white/15" : "bg-surface-3")} aria-hidden>
          <div className={cn("h-full rounded-full transition-[width] duration-700", brand ? "bg-accent" : "bg-series-1")} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      )}

      <div className={cn("mt-3 flex items-center gap-1.5 text-xs", brand ? "text-white/70" : "text-muted")}>
        {delta ? (
          <>
            <span className={cn("inline-flex items-center gap-0.5 font-semibold", deltaColor)}>
              <DeltaIcon size={14} aria-hidden />
              {delta.text}
            </span>
            {delta.hint && <span className="truncate">{delta.hint}</span>}
          </>
        ) : (
          hint && <span className="truncate">{hint}</span>
        )}
      </div>
    </Card>
  );
}
