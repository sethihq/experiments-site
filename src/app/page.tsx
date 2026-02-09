"use client";

import { Suspense } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { experiments } from "@/lib/experiments";
import { GalleryCard } from "@/components/gallery-card";
import { NavToggle } from "@/components/nav-toggle";
import { TagFilter } from "@/components/tag-filter";
import { useFilteredExperiments } from "@/hooks/useFilteredExperiments";

function GalleryContent() {
  const {
    filteredByYear,
    selectedTags,
    allTags,
    toggleTag,
    clearTags,
    filteredCount,
  } = useFilteredExperiments();

  const years = Object.keys(filteredByYear).sort((a, b) => Number(b) - Number(a));
  const hasSelection = selectedTags.length > 0;

  return (
    <>
      {/* Header */}
      <header className="mt-[20vh] mb-[10vh] flex flex-col items-center">
        <h1 className="flex items-center gap-4 text-4xl lg:text-5xl uppercase tracking-tight">
          <span className="font-serif italic text-[var(--fg-90)]">GALLERY</span>
          <span className="w-24 lg:w-32 h-0.5 bg-[var(--foreground)] animate-line" />
          <span className="font-mono text-[var(--fg-70)]">
            {hasSelection ? (
              <span className="tabular-nums">
                {filteredCount}
                <span className="text-[var(--fg-30)]">/{experiments.length}</span>
              </span>
            ) : (
              experiments.length
            )}
          </span>
        </h1>
      </header>

      {/* Tag Filter */}
      <TagFilter
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onClearTags={clearTags}
      />

      {/* Gallery */}
      <section className="w-full max-w-5xl px-5">
        <LayoutGroup>
          <AnimatePresence mode="popLayout">
            {years.length > 0 ? (
              years.map((year) => (
                <motion.div
                  key={year}
                  className="mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  {/* Year Label */}
                  <h2 className="text-[var(--fg-40)] text-sm my-3 px-5">
                    Feb {year} Collection [{filteredByYear[year].length}]
                  </h2>

                  {/* Grid */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 text-sm"
                    layout
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredByYear[year].map((experiment) => (
                        <motion.div
                          key={experiment.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          layout
                        >
                          <GalleryCard experiment={experiment} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-[var(--fg-40)] text-sm">
                  No experiments match the selected tags
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </LayoutGroup>
      </section>

      {/* Footer */}
      <footer className="py-16 text-center space-y-3">
        <p className="text-[var(--fg-20)] text-xs">
          WebGL & Three.js Experiments
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-[var(--fg-25)]">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link-hover-underline hover:text-[var(--fg-50)] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="link-hover-underline hover:text-[var(--fg-50)] transition-colors"
          >
            Twitter
          </a>
        </div>
      </footer>
    </>
  );
}

export default function Home() {
  return (
    <>
      <main className="min-h-screen flex flex-col items-center">
        {/* Navigation */}
        <NavToggle />

        {/* Wrap in Suspense for useSearchParams */}
        <Suspense
          fallback={
            <div className="mt-[20vh] mb-[10vh] flex flex-col items-center">
              <h1 className="flex items-center gap-4 text-4xl lg:text-5xl uppercase tracking-tight">
                <span className="font-serif italic text-[var(--fg-90)]">GALLERY</span>
                <span className="w-24 lg:w-32 h-0.5 bg-[var(--foreground)] animate-line" />
                <span className="font-mono text-[var(--fg-70)]">{experiments.length}</span>
              </h1>
            </div>
          }
        >
          <GalleryContent />
        </Suspense>
      </main>
    </>
  );
}
