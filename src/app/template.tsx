"use client";

import { ReactNode } from "react";
import { RouteTransitionProvider } from "@/components/route-transition-provider";

/**
 * Template component for route transitions
 *
 * Unlike layout.tsx, template.tsx re-renders on every route change.
 * This is essential for AnimatePresence to work properly with exit animations,
 * as it needs to detect when children are being unmounted.
 */
export default function Template({ children }: { children: ReactNode }) {
  return <RouteTransitionProvider>{children}</RouteTransitionProvider>;
}
