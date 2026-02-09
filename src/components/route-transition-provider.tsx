"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { pageVariants, pageTransition } from "@/lib/transition-variants";

interface RouteTransitionProviderProps {
  children: ReactNode;
}

/**
 * Route transition provider that wraps page content with AnimatePresence
 * Used in template.tsx to enable exit animations on route changes
 *
 * Key insight: template.tsx re-mounts on each route change (unlike layout.tsx),
 * which allows AnimatePresence to detect when children are unmounting
 */
export function RouteTransitionProvider({ children }: RouteTransitionProviderProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
