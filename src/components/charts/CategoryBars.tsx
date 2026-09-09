import { motion } from "framer-motion";
import type { CategorySlice } from "@/lib/analytics";
import { formatCurrency } from "@/lib/format";
import { useChartColors } from "./chartTheme";

/**
 * Part-to-whole as horizontal bars (one hue — categories are nominal, so bar
 * length carries the value and color does no extra work). "Other" is gray.
 */
export function CategoryBars({ slices, currency = "USD" }: { slices: CategorySlice[]; currency?: string }) {
  const c = useChartColors();
  const max = Math.max(0, ...slices.map((s) => s.amount));

  return (
    <ul className="space-y-3.5">
      {slices.map((s, i) => {
        const isOther = s.id === "__other";
        const width = max > 0 ? Math.max(2, (s.amount / max) * 100) : 0;
        return (
          <li key={s.id ?? `slice-${i}`}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate font-medium text-ink">{s.name}</span>
                <span className="shrink-0 text-xs text-muted">
                  {s.count} {s.count === 1 ? "txn" : "txns"}
                </span>
              </span>
              <span className="flex shrink-0 items-baseline gap-2">
                <span className="tabular font-semibold text-ink">{formatCurrency(s.amount, currency)}</span>
                <span className="tabular w-10 text-right text-xs text-muted">{Math.round(s.share * 100)}%</span>
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3" role="presentation">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: isOther ? c.axis : c.series1 }}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
