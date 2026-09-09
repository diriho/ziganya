import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useChartColors } from "./chartTheme";

export interface RingMeterProps {
  /** 0..1 (values above 1 fill the ring and are shown as over). */
  ratio: number;
  size?: number;
  thickness?: number;
  state?: "good" | "warn" | "over";
  children?: ReactNode;
  label?: string;
}

/** A meter: the fill carries severity, the track is a lighter step of the same hue. */
export function RingMeter({ ratio, size = 176, thickness = 14, state = "good", children, label }: RingMeterProps) {
  const c = useChartColors();
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
  const color = state === "over" ? c.danger : state === "warn" ? c.warn : c.series1;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={label}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeOpacity={0.16} strokeWidth={thickness} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}
