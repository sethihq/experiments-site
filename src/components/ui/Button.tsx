import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const variantClasses = {
  default:
    "bg-[var(--fg-06)] text-[var(--fg-70)] hover:bg-[var(--fg-10)] hover:text-[var(--fg-90)]",
  ghost:
    "bg-transparent text-[var(--fg-50)] hover:bg-[var(--fg-06)] hover:text-[var(--fg-80)]",
  outline:
    "bg-transparent border border-[var(--border)] text-[var(--fg-60)] hover:bg-[var(--fg-03)] hover:text-[var(--fg-80)]",
  accent:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent)]/90",
};

const sizeClasses = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  icon: "h-10 w-10 p-0",
};

/**
 * Button - Interactive button component
 * Supports multiple variants and sizes with icon slots
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "default",
      size = "md",
      startIcon,
      endIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center",
        "rounded-xl font-medium",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
        "disabled:opacity-50 disabled:pointer-events-none",
        "active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {startIcon && <span className="shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="shrink-0">{endIcon}</span>}
    </button>
  )
);

Button.displayName = "Button";
