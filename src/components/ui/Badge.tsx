import { cn } from "@/lib/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "accent" | "success" | "warning";
  size?: "sm" | "md";
}

const variantClasses = {
  default: "bg-[var(--fg-06)] text-[var(--fg-60)]",
  outline: "bg-transparent border border-[var(--border)] text-[var(--fg-50)]",
  accent: "bg-[var(--accent-muted)] text-[var(--accent)]",
  success: "bg-emerald-500/10 text-emerald-400",
  warning: "bg-amber-500/10 text-amber-400",
};

const sizeClasses = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-xs",
};

/**
 * Badge - Small status indicator
 * For labels, tags, and status indicators
 */
export function Badge({
  variant = "default",
  size = "md",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.displayName = "Badge";
