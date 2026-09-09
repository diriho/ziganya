import { initialsOf } from "@/lib/format";
import { cn } from "./cn";

export interface AvatarProps {
  name?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs rounded-lg",
  md: "h-10 w-10 text-sm rounded-xl",
  lg: "h-12 w-12 text-base rounded-2xl",
  xl: "h-16 w-16 text-xl rounded-2xl",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center overflow-hidden bg-brand font-display font-bold text-accent ring-1 ring-line dark:bg-brand-soft dark:text-brand",
        sizes[size],
        className
      )}
      aria-hidden
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" /> : initialsOf(name)}
    </span>
  );
}
