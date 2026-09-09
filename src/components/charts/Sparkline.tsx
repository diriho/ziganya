import { useId } from "react";
import { useChartColors } from "./chartTheme";

export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  /** Paint the line in the accent instead of the de-emphasis gray. */
  emphasize?: boolean;
  className?: string;
  ariaLabel?: string;
}

/** 12-ish point sparkline; the last point is marked. */
export function Sparkline({ values, width = 112, height = 32, emphasize, className, ariaLabel }: SparklineProps) {
  const c = useChartColors();
  const id = useId();
  if (values.length < 2) return null;

  const max = Math.max(...values, 1e-9);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const pad = 3;
  const stepX = (width - pad * 2) / (values.length - 1);
  const points = values.map((v, i) => {
    const x = pad + i * stepX;
    const y = pad + (1 - (v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });
  const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${points[points.length - 1][0].toFixed(1)},${height - pad} L${pad},${height - pad} Z`;
  const stroke = emphasize ? c.accent : c.axis;
  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={3.5} fill={stroke} stroke="currentColor" strokeOpacity={0.9} strokeWidth={2} />
    </svg>
  );
}
