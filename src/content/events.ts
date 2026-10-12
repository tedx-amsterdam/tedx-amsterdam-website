import { amsterdamDay } from "@/lib/dates";
import { sortEvents } from "./sort";
import type { TedxEvent } from "./types";

// Upcoming events include today's, so an evening event is not listed as
// past on the morning it takes place. The site is static: "now" is the
// build time, so the split is only as fresh as the last build.
export function splitEvents(events: readonly TedxEvent[], now: Date): { upcoming: TedxEvent[]; past: TedxEvent[] } {
  const today = amsterdamDay(now);
  const isUpcoming = (event: TedxEvent) => amsterdamDay(new Date(event.startsAt)) >= today;
  // Sorted here, so the order never depends on what the caller passes in.
  const sorted = sortEvents(events);
  return {
    upcoming: sorted.filter(isUpcoming),
    // Most recent first.
    past: sorted.filter((event) => !isUpcoming(event)).toReversed(),
  };
}
