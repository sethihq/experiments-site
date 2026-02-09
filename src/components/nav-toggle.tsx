"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useRef, useState, useEffect, useCallback } from "react";
import { useSound } from "@/hooks/useSound";

const navItems = [
  { label: "Gallery", href: "/" },
  { label: "Skills", href: "/skills" },
  { label: "Resources", href: "/resources" },
];

export function NavToggle() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 6, width: 70 });
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { playHover, playNavigate } = useSound();

  // Determine active index based on pathname
  const activeIndex = navItems.findIndex((item) => {
    if (item.href === "/") return pathname === "/";
    return pathname.startsWith(item.href);
  });

  const updateIndicator = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const links = container.querySelectorAll("a");
    const activeElement = links[activeIndex] as HTMLElement;
    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(updateIndicator, 10);
    return () => clearTimeout(timer);
  }, [updateIndicator]);

  useEffect(() => {
    if (mounted) {
      updateIndicator();
    }
  }, [activeIndex, pathname, mounted, updateIndicator]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-8">
      <motion.div
        ref={containerRef}
        className="relative flex items-center text-sm bg-[var(--muted)] p-1.5 border border-[var(--border)]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        style={{
          borderRadius: "14px",
        }}
      >
        {/* Sliding background indicator */}
        {mounted && (
          <motion.div
            className="absolute h-[calc(100%-12px)]"
            initial={false}
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 28,
              mass: 0.8,
            }}
            style={{
              top: 6,
              borderRadius: "10px",
              background: "var(--muted3)",
              boxShadow: "inset 0 1px 0 var(--fg-05), 0 1px 2px var(--fg-10)",
            }}
          />
        )}

        {navItems.map((item, index) => {
          const isActive = index === activeIndex;
          const isHovered = index === hoveredIndex;
          return (
            <motion.div
              key={item.href}
              onMouseEnter={() => {
                setHoveredIndex(index);
                if (!isActive) playHover();
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link
                href={item.href}
                className={`relative z-10 block px-5 py-2 font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-[var(--foreground)]"
                    : isHovered
                    ? "text-[var(--fg-70)]"
                    : "text-[var(--fg-35)]"
                }`}
                style={{ borderRadius: "10px" }}
                onClick={() => {
                  if (!isActive) playNavigate();
                }}
              >
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </nav>
  );
}
