import type { Speaker } from "./types";

// Implemented by every content source (fixtures, Webflow, later Sanity).
// Sources return validated, sanitised domain objects and throw on bad data,
// so a broken response fails the build instead of rendering a broken page.
export interface ContentSource {
  // Published speakers of the current edition, in display order.
  getSpeakers(): Promise<Speaker[]>;
  getSpeaker(slug: string): Promise<Speaker | undefined>;
}
