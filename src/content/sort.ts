import type { Speaker } from "./types";

// Display order for every source: by order ascending, speakers without an
// order last, then by name so the result is stable across builds.
export function sortSpeakers(speakers: readonly Speaker[]): Speaker[] {
  return speakers.toSorted(
    (a, b) =>
      (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY) || a.name.localeCompare(b.name, "en"),
  );
}
