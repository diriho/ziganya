import { Bar, CartesianGrid, ComposedChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import { AXIS_FONT, axisCurrency, niceTicks, useChartColors } from "./chartTheme";
import { ChartTooltip } from "./ChartTooltip";

export interface ChargeRow {
  key: string;
  label: string;
  longLabel: string;
  amount: number;
  count: number;
}

/** Single-series column chart of projected subscription charges per month. */
export function UpcomingChargesChart({ data, currency = "USD", height = 220 }: { data: ChargeRow[]; currency?: string; height?: number }) {
  const c = useChartColors();
  const max = Math.max(0, ...data.map((d) => d.amount));
  const ticks = niceTicks(max * 1.08, 3);

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 22, right: 8, bottom: 0, left: 0 }} barCategoryGap="36%">
          <CartesianGrid vertical={false} stroke={c.grid} strokeWidth={1} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: c.axis, strokeWidth: 1 }}
            tick={{ ...AXIS_FONT, fill: c.muted }}
            tickMargin={10}
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
            content={<ChartTooltip currency={currency} showCount={false} />}
            isAnimationActive={false}
            wrapperStyle={{ outline: "none" }}
          />
          <Bar
            dataKey="amount"
            name="Charges"
            fill={c.series1}
            radius={[4, 4, 0, 0]}
            maxBarSize={28}
            isAnimationActive
            animationDuration={600}
            activeBar={{ fill: c.series1, fillOpacity: 0.78 }}
          >
            {/* Label only the peak month — direct labels are selective. */}
            <LabelList
              dataKey="amount"
              position="top"
              offset={6}
              fill={c.ink2}
              fontSize={11}
              fontWeight={600}
              formatter={(v: unknown) => (typeof v === "number" && v === max && v > 0 ? formatCurrency(v, currency, { compact: v >= 1000 }) : "")}
            />
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
