import { experiments, Experiment } from "./experiments";

/**
 * Get all unique tags from experiments, sorted alphabetically
 */
export function getAllTags(): string[] {
  const tags = new Set<string>();
  experiments.forEach((exp) => exp.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags).sort();
}

/**
 * Filter experiments by selected tags (OR logic - matches ANY selected tag)
 * Returns all experiments if no tags are selected
 */
export function filterExperiments(
  experimentList: Experiment[],
  selectedTags: string[]
): Experiment[] {
  if (selectedTags.length === 0) return experimentList;
  return experimentList.filter((exp) =>
    selectedTags.some((tag) => exp.tags.includes(tag))
  );
}

/**
 * Group filtered experiments by year
 */
export function getFilteredExperimentsByYear(
  selectedTags: string[]
): Record<string, Experiment[]> {
  const filtered = filterExperiments(experiments, selectedTags);
  const grouped: Record<string, Experiment[]> = {};

  filtered.forEach((exp) => {
    if (!grouped[exp.year]) {
      grouped[exp.year] = [];
    }
    grouped[exp.year].push(exp);
  });

  return grouped;
}
