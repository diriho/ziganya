import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "./cn";

type Padding = "none" | "sm" | "md" | "lg";

const paddings: Record<Padding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  /** Dark brand surface for the hero tile. */
  tone?: "default" | "brand";
  interactive?: boolean;
}

export function Card({ padding = "md", tone = "default", interactive, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "card relative",
        tone === "brand" && "border-transparent bg-[#063b1e] text-white shadow-pop dark:bg-[#0f2f1c]",
        interactive && "transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-pop",
        paddings[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  className?: string;
  as?: "h2" | "h3";
}

export function CardHeader({ title, subtitle, eyebrow, action, className, as: Tag = "h3" }: CardHeaderProps) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <Tag className="text-base font-bold leading-tight sm:text-lg">{title}</Tag>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}
