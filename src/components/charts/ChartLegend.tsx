import { cn } from "@/components/ui/cn";

export interface LegendItem {
  name: string;
  color: string;
  kind?: "bar" | "line";
}

/** Legend swatches mirror the mark: a rect for bars/areas, a stroke for lines. */
export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  if (items.length < 2) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-2", className)} aria-label="Legend">
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-2">
          {item.kind === "line" ? (
            <span className="relative inline-flex h-3 w-4 items-center" aria-hidden>
              <span className="h-0.5 w-full rounded-full" style={{ backgroundColor: item.color }} />
              <span
                className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface"
                style={{ backgroundColor: item.color }}
              />
            </span>
          ) : (
            <span className="inline-block h-3 w-3 rounded-[3px]" style={{ backgroundColor: item.color }} aria-hidden />
          )}
          <span className="font-medium">{item.name}</span>
        </li>
      ))}
    </ul>
  );
}
