import { cn } from "@/lib/cn";

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Box - Base layout primitive
 * An unstyled div wrapper for composition
 */
export function Box({ className, ...props }: BoxProps) {
  return <div className={cn(className)} {...props} />;
}

Box.displayName = "Box";
