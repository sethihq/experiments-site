import { cn } from "@/lib/cn";

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  wrap?: boolean | "wrap" | "nowrap" | "wrap-reverse";
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  inline?: boolean;
}

const directionMap = {
  row: "flex-row",
  column: "flex-col",
  "row-reverse": "flex-row-reverse",
  "column-reverse": "flex-col-reverse",
};

const alignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const gapMap = {
  0: "gap-0",
  1: "gap-1",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  7: "gap-7",
  8: "gap-8",
  9: "gap-9",
  10: "gap-10",
};

/**
 * Flex - Flexbox layout helper
 * Provides common flexbox patterns with sensible defaults
 */
export function Flex({
  direction = "row",
  align,
  justify,
  wrap,
  gap,
  inline = false,
  className,
  ...props
}: FlexProps) {
  const wrapClass =
    wrap === true
      ? "flex-wrap"
      : wrap === "nowrap"
      ? "flex-nowrap"
      : wrap === "wrap-reverse"
      ? "flex-wrap-reverse"
      : undefined;

  return (
    <div
      className={cn(
        inline ? "inline-flex" : "flex",
        directionMap[direction],
        align && alignMap[align],
        justify && justifyMap[justify],
        gap !== undefined && gapMap[gap],
        wrapClass,
        className
      )}
      {...props}
    />
  );
}

Flex.displayName = "Flex";
