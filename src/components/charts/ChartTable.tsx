import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export interface ChartTableColumn<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
}

/** The accessible twin of a chart: the same numbers as a plain table. */
export function ChartTable<T>({
  rows,
  columns,
  caption,
  className,
  rowKey,
}: {
  rows: T[];
  columns: ChartTableColumn<T>[];
  caption: string;
  className?: string;
  rowKey: (row: T) => string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-line", className)}>
      <table className="w-full min-w-[420px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-surface-2">
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={cn(
                  "px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted",
                  c.align === "right" && "text-right"
                )}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-line last:border-b-0">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-2.5 text-ink-2", c.align === "right" && "tabular text-right font-medium text-ink")}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
