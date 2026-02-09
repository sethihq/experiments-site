"use client";

import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onClearTags: () => void;
}

export function TagFilter({
  tags,
  selectedTags,
  onToggleTag,
  onClearTags,
}: TagFilterProps) {
  const { playClick } = useSound();
  const hasSelection = selectedTags.length > 0;

  const handleAllClick = () => {
    playClick();
    onClearTags();
  };

  const handleTagClick = (tag: string) => {
    playClick();
    onToggleTag(tag);
  };

  return (
    <div className="w-full max-w-5xl px-5 mb-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* All pill */}
        <motion.button
          type="button"
          onClick={handleAllClick}
          className={`
            flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium
            transition-colors duration-200
            ${
              !hasSelection
                ? "bg-[var(--fg-15)] text-[var(--fg-90)]"
                : "bg-[var(--fg-05)] text-[var(--fg-40)] hover:bg-[var(--fg-08)]"
            }
          `}
          whileTap={{ scale: 0.95 }}
        >
          All
        </motion.button>

        {/* Divider */}
        <div className="flex-shrink-0 w-px h-4 bg-[var(--fg-10)]" />

        {/* Tag pills */}
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <motion.button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={`
                flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium
                transition-colors duration-200
                ${
                  isSelected
                    ? "bg-[var(--fg-15)] text-[var(--fg-90)]"
                    : "bg-[var(--fg-05)] text-[var(--fg-40)] hover:bg-[var(--fg-08)]"
                }
              `}
              whileTap={{ scale: 0.95 }}
              layout
            >
              {tag}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
