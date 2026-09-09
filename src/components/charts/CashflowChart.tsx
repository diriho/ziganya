import { useMemo } from "react";
import { Area, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Bucket } from "@/lib/analytics";
import { AXIS_FONT, axisCurrency, niceTicks, useChartColors } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";
import { ChartLegend } from "./ChartLegend";

export interface CashflowChartProps {
  data: Bucket[];
  currency?: string;
  height?: number;
}

/** Income vs expenses as two 2px lines with a ~10% area wash, one shared axis. */
export function CashflowChart({ data, currency = "USD", height = 260 }: CashflowChartProps) {
  const c = useChartColors();
  const hasIncome = data.some((d) => d.income > 0);
  const hasExpense = data.some((d) => d.expense > 0);
  const ticks = useMemo(() => niceTicks(Math.max(0, ...data.map((d) => Math.max(d.expense, d.income)))), [data]);

  const legend = [
    ...(hasExpense ? [{ name: "Expenses", color: c.series1, kind: "line" as const }] : []),
    ...(hasIncome ? [{ name: "Income", color: c.series2, kind: "line" as const }] : []),
  ];

  const dot = (color: string) => ({ r: 3.5, strokeWidth: 2, stroke: c.surface, fill: color });
  const activeDot = (color: string) => ({ r: 5, strokeWidth: 2, stroke: c.surface, fill: color });
  const showDots = data.length <= 31;

  return (
    <div>
      <ChartLegend items={legend} className="mb-3" />
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="cf-expense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.series1} stopOpacity={0.16} />
                <stop offset="100%" stopColor={c.series1} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="cf-income" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.series2} stopOpacity={0.16} />
                <stop offset="100%" stopColor={c.series2} stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
              cursor={{ stroke: c.axis, strokeWidth: 1 }}
              content={<ChartTooltip currency={currency} />}
              isAnimationActive={false}
              wrapperStyle={{ outline: "none" }}
            />
            {hasExpense && (
              <Area
                type="monotone"
                dataKey="expense"
                name="Expenses"
                stroke={c.series1}
                strokeWidth={2}
                fill="url(#cf-expense)"
                dot={showDots ? dot(c.series1) : false}
                activeDot={activeDot(c.series1)}
                isAnimationActive
                animationDuration={700}
              />
            )}
            {hasIncome && (
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke={c.series2}
                strokeWidth={2}
                fill="url(#cf-income)"
                dot={showDots ? dot(c.series2) : false}
                activeDot={activeDot(c.series2)}
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
