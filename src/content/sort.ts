import type { Partner, TedxEvent, Speaker } from "./types";

// Display order for every source: by order ascending, speakers without an
// order last, then by name so the result is stable across builds.
export function sortSpeakers(speakers: readonly Speaker[]): Speaker[] {
  return speakers.toSorted(
    (a, b) =>
      (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY) || a.name.localeCompare(b.name, "en"),
  );
}

// Events by start, earliest first, then by title so the order is stable.
export function sortEvents(events: readonly TedxEvent[]): TedxEvent[] {
  return events.toSorted((a, b) => a.startsAt.localeCompare(b.startsAt) || a.title.localeCompare(b.title, "en"));
}

// Partners by order ascending, those without an order last, then by name:
// the CMS gives several partners the same order.
export function sortPartners(partners: readonly Partner[]): Partner[] {
  return partners.toSorted(
    (a, b) =>
      (a.order ?? Number.POSITIVE_INFINITY) - (b.order ?? Number.POSITIVE_INFINITY) || a.name.localeCompare(b.name, "en"),
  );
}
