import { formatCurrency } from "@/lib/format";

interface PayloadEntry {
  name?: string | number;
  value?: number | string;
  color?: string;
  stroke?: string;
  fill?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<PayloadEntry>;
  label?: string | number;
  currency?: string;
  /** Show a "count" footer if the datum carries one. */
  showCount?: boolean;
}

/**
 * Shared tooltip: values lead, series names follow, keyed by a short stroke of
 * the series color. Text always wears text tokens, never the series color.
 */
export function ChartTooltip({ active, payload, label, currency = "USD", showCount = true }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0]?.payload ?? {};
  const title = (datum.longLabel as string | undefined) ?? String(label ?? "");
  const count = typeof datum.count === "number" ? (datum.count as number) : null;

  return (
    <div className="pointer-events-none min-w-[176px] rounded-xl border border-line bg-surface px-3.5 py-3 text-ink shadow-pop">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</p>
      <ul className="space-y-1.5">
        {payload.map((entry, i) => {
          const color = entry.color ?? entry.stroke ?? entry.fill ?? "currentColor";
          const value = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0);
          return (
            <li key={`${String(entry.dataKey)}-${i}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-xs text-ink-2">
                <span className="inline-block h-0.5 w-3.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
                {String(entry.name ?? entry.dataKey ?? "")}
              </span>
              <span className="tabular text-sm font-semibold">{formatCurrency(value, currency)}</span>
            </li>
          );
        })}
      </ul>
      {showCount && count !== null && (
        <p className="mt-2 border-t border-line pt-2 text-[11px] text-muted">
          {count} {count === 1 ? "transaction" : "transactions"}
        </p>
      )}
    </div>
  );
}
