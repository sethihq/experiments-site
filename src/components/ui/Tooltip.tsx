"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/cn";

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  delayDuration?: number;
  className?: string;
}

/**
 * Tooltip - Hover tooltip component
 * Displays additional information on hover with customizable positioning
 */
export function Tooltip({
  children,
  content,
  side = "bottom",
  sideOffset = 8,
  delayDuration = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayDuration);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      <div
        role="tooltip"
        style={{ ["--offset" as string]: `${sideOffset}px` }}
        className={cn(
          "absolute z-[var(--z-toast)] pointer-events-none",
          "px-3 py-1.5 rounded-lg",
          "bg-[var(--muted)] border border-[var(--border)]",
          "text-xs text-[var(--fg-70)] whitespace-nowrap",
          "transition-all duration-150",
          positionClasses[side],
          isVisible
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95",
          className
        )}
      >
        {content}
      </div>
    </div>
  );
}

Tooltip.displayName = "Tooltip";
