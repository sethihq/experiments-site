"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { experiments, Experiment } from "@/lib/experiments";
import { filterExperiments, getAllTags } from "@/lib/tags";

interface UseFilteredExperimentsReturn {
  filteredExperiments: Experiment[];
  filteredByYear: Record<string, Experiment[]>;
  selectedTags: string[];
  allTags: string[];
  toggleTag: (tag: string) => void;
  clearTags: () => void;
  totalCount: number;
  filteredCount: number;
}

/**
 * Hook for managing tag-based experiment filtering with URL sync
 * Supports multi-select with OR logic
 */
export function useFilteredExperiments(): UseFilteredExperimentsReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL
  const [selectedTags, setSelectedTags] = useState<string[]>(() => {
    const tagsParam = searchParams.get("tags");
    if (!tagsParam) return [];
    return tagsParam.split(",").filter(Boolean);
  });

  // Sync URL when tags change
  useEffect(() => {
    const current = new URLSearchParams(searchParams.toString());

    if (selectedTags.length > 0) {
      current.set("tags", selectedTags.join(","));
    } else {
      current.delete("tags");
    }

    const search = current.toString();
    const newUrl = search ? `${pathname}?${search}` : pathname;

    // Use replace to avoid adding to history for each tag toggle
    router.replace(newUrl, { scroll: false });
  }, [selectedTags, pathname, router, searchParams]);

  // Get all available tags
  const allTags = useMemo(() => getAllTags(), []);

  // Filter experiments based on selected tags
  const filteredExperiments = useMemo(
    () => filterExperiments(experiments, selectedTags),
    [selectedTags]
  );

  // Group filtered experiments by year
  const filteredByYear = useMemo(() => {
    const grouped: Record<string, Experiment[]> = {};
    filteredExperiments.forEach((exp) => {
      if (!grouped[exp.year]) {
        grouped[exp.year] = [];
      }
      grouped[exp.year].push(exp);
    });
    return grouped;
  }, [filteredExperiments]);

  // Toggle a tag selection
  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag);
      }
      return [...prev, tag];
    });
  }, []);

  // Clear all selected tags
  const clearTags = useCallback(() => {
    setSelectedTags([]);
  }, []);

  return {
    filteredExperiments,
    filteredByYear,
    selectedTags,
    allTags,
    toggleTag,
    clearTags,
    totalCount: experiments.length,
    filteredCount: filteredExperiments.length,
  };
}
