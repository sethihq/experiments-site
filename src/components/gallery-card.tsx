"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Experiment } from "@/lib/experiments";
import { useSound } from "@/hooks/useSound";

interface GalleryCardProps {
  experiment: Experiment;
}

export function GalleryCard({ experiment }: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { playHover, playClick } = useSound();

  return (
    <Link
      href={experiment.href}
      className="group block cursor-pointer rounded-2xl p-2 transition-colors duration-300 hover:bg-[var(--fg-02)]"
      onMouseEnter={() => {
        setIsHovered(true);
        playHover();
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={playClick}
    >
      {/* Preview Thumbnail */}
      <motion.div
        className="relative h-52 rounded-xl overflow-hidden"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Static background */}
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundColor: experiment.previewColor || "var(--muted)" }}
        />
        {/* Experiment number watermark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[var(--fg-04)] font-mono text-8xl font-bold select-none transition-all duration-300 group-hover:text-[var(--fg-06)] group-hover:scale-105">
            {experiment.number.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* New badge - compact */}
        {experiment.isNew && (
          <span className="absolute top-2.5 right-2.5 text-[9px] font-medium text-[var(--accent)] px-1.5 py-0.5 rounded-md bg-[var(--accent)]/10">
            New
          </span>
        )}
      </motion.div>

      {/* Title Row */}
      <div className="flex items-center justify-between gap-3 px-1 pb-1 pt-3">
        <span className="text-[var(--fg-35)] text-sm transition-colors duration-200 group-hover:text-[var(--fg-60)]">
          {experiment.title.toLowerCase().replace(/\s+/g, "")}
        </span>
        <span className="flex-1 h-px bg-[var(--fg-06)] group-hover:bg-[var(--fg-15)] transition-colors duration-300" />
        <span className="text-[var(--fg-25)] text-sm tabular-nums group-hover:text-[var(--fg-45)] transition-colors duration-300">
          {experiment.year}
        </span>
      </div>
    </Link>
  );
}
