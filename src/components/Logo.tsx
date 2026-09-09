import { cn } from "@/components/ui/cn";

export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-[10px] bg-[#063b1e] text-[#6eff8a] shadow-sm", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 64 64" width={size * 0.62} height={size * 0.62} fill="none">
        <path d="M18 20h28l-22 24h22" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={cn("font-display text-lg font-bold tracking-tight text-ink", className)}>Ziganya</span>;
}
