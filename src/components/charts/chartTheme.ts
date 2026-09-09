import { useMemo } from "react";
import { useTheme } from "@/providers/theme";

export function readCssVar(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export interface ChartColors {
  series1: string;
  series2: string;
  grid: string;
  axis: string;
  muted: string;
  ink: string;
  ink2: string;
  surface: string;
  surface3: string;
  good: string;
  warn: string;
  danger: string;
  brand: string;
  accent: string;
}

/**
 * Chart colors resolved from the CSS tokens. Recharts paints SVG attributes,
 * which cannot reference CSS variables, so we read the computed values and
 * re-read them whenever the theme flips.
 */
export function useChartColors(): ChartColors {
  const { resolved } = useTheme();
  return useMemo<ChartColors>(
    () => ({
      series1: readCssVar("--c-series-1", "#15803d"),
      series2: readCssVar("--c-series-2", "#2a78d6"),
      grid: readCssVar("--c-grid", "#e6eae6"),
      axis: readCssVar("--c-axis", "#c3cbc5"),
      muted: readCssVar("--c-muted", "#76827a"),
      ink: readCssVar("--c-ink", "#0f1a13"),
      ink2: readCssVar("--c-ink-2", "#3d4a41"),
      surface: readCssVar("--c-surface", "#ffffff"),
      surface3: readCssVar("--c-surface-3", "#e9ede9"),
      good: readCssVar("--c-good", "#15803d"),
      warn: readCssVar("--c-warn", "#b45309"),
      danger: readCssVar("--c-danger", "#dc2626"),
      brand: readCssVar("--c-brand", "#063b1e"),
      accent: readCssVar("--c-accent", "#6eff8a"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-read when the theme changes
    [resolved]
  );
}

export const AXIS_FONT = { fontSize: 11, fontFamily: "inherit" } as const;

/** Compact currency for axis ticks: $0, $250, $1.2K */
export function axisCurrency(value: number, currency = "USD"): string {
  const abs = Math.abs(value);
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: abs >= 1000 ? "compact" : "standard",
    maximumFractionDigits: abs >= 1000 ? 1 : 0,
    minimumFractionDigits: 0,
  });
  return fmt.format(value);
}

/**
 * Round y-axis ticks: 0 → a clean top (1/2/2.5/5 × 10^k steps) with ~8% headroom,
 * so the axis reads 0 / 1,000 / 2,000 instead of 0 / 880 / 1,760.
 */
export function niceTicks(maxValue: number, targetCount = 4): number[] {
  if (!Number.isFinite(maxValue) || maxValue <= 0) return [0, 25, 50, 75, 100];
  const padded = maxValue * 1.08;
  const rough = padded / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const candidates = [1, 2, 2.5, 5, 10].map((m) => m * magnitude);
  const step = candidates.find((c) => c >= rough) ?? candidates[candidates.length - 1];
  const top = Math.ceil(padded / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + step / 1000; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}
