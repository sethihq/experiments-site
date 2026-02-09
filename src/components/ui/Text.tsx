import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "label" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "default" | "muted" | "subtle" | "accent" | "inherit";
  align?: "left" | "center" | "right";
  leading?: "tight" | "normal" | "relaxed";
  truncate?: boolean;
}

const sizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};

const weightMap = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

const colorMap = {
  default: "text-[var(--fg-90)]",
  muted: "text-[var(--fg-60)]",
  subtle: "text-[var(--fg-40)]",
  accent: "text-[var(--accent)]",
  inherit: "text-inherit",
};

const alignMap = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const leadingMap = {
  tight: "leading-tight",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
};

/**
 * Text - Typography primitive
 * Handles text styling with consistent design tokens
 */
export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = "p",
      size = "base",
      weight = "normal",
      color = "default",
      align,
      leading,
      truncate = false,
      className,
      ...props
    },
    ref
  ) => (
    <Component
      // @ts-expect-error - ref type mismatch with dynamic element
      ref={ref}
      className={cn(
        sizeMap[size],
        weightMap[weight],
        colorMap[color],
        align && alignMap[align],
        leading && leadingMap[leading],
        truncate && "truncate",
        className
      )}
      {...props}
    />
  )
);

Text.displayName = "Text";
