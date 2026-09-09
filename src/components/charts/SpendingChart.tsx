import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Bucket } from "@/lib/analytics";
import { AXIS_FONT, axisCurrency, niceTicks, useChartColors } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";
import { ChartLegend } from "./ChartLegend";

export interface SpendingChartProps {
  data: Bucket[];
  currency?: string;
  height?: number;
  /** Overlay the income line (same axis). Off by default so spending stays readable. */
  showIncome?: boolean;
}

/**
 * Spending over time: expenses as thin columns (the subject) with income as a
 * 2px line for context. One axis, one unit, hover reads every series at that X.
 */
export function SpendingChart({ data, currency = "USD", height = 280, showIncome = false }: SpendingChartProps) {
  const c = useChartColors();
  const hasIncome = showIncome && data.some((d) => d.income > 0);

  const ticks = useMemo(() => {
    const max = Math.max(0, ...data.map((d) => Math.max(d.expense, hasIncome ? d.income : 0)));
    return niceTicks(max);
  }, [data, hasIncome]);

  const legend = useMemo(
    () => [
      { name: "Spending", color: c.series1, kind: "bar" as const },
      ...(hasIncome ? [{ name: "Income", color: c.series2, kind: "line" as const }] : []),
    ],
    [c.series1, c.series2, hasIncome]
  );

  return (
    <div>
      <ChartLegend items={legend} className="mb-3" />
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="32%">
            <CartesianGrid vertical={false} stroke={c.grid} strokeWidth={1} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: c.axis, strokeWidth: 1 }}
              tick={{ ...AXIS_FONT, fill: c.muted }}
              interval="preserveStartEnd"
              tickMargin={10}
              minTickGap={28}
            />
            <YAxis
              width={52}
              tickLine={false}
              axisLine={false}
              tick={{ ...AXIS_FONT, fill: c.muted }}
              tickFormatter={(v: number) => axisCurrency(v, currency)}
              ticks={ticks}
              domain={[0, ticks[ticks.length - 1]]}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: c.ink, fillOpacity: 0.05, radius: 6 }}
              content={<ChartTooltip currency={currency} />}
              isAnimationActive={false}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar
              dataKey="expense"
              name="Spending"
              fill={c.series1}
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              minPointSize={0}
              isAnimationActive
              animationDuration={650}
              animationEasing="ease-out"
              activeBar={{ fill: c.series1, fillOpacity: 0.78 }}
            />
            {hasIncome && (
              <Line
                type="linear"
                dataKey="income"
                name="Income"
                stroke={c.series2}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={{ r: 4, strokeWidth: 2, stroke: c.surface, fill: c.series2 }}
                activeDot={{ r: 5, strokeWidth: 2, stroke: c.surface, fill: c.series2 }}
                isAnimationActive
                animationDuration={700}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
