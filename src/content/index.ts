import { getEnv } from "@/lib/env";
import { fixtureSource } from "./fixtures";
import type { ContentSource } from "./source";
import type { Speaker } from "./types";

// The only module pages and components import content from. Which source
// is active is decided here, from CONTENT_SOURCE, and nowhere else.

export type { Image, SafeHtml, Speaker } from "./types";

function activeSource(): ContentSource {
  const { CONTENT_SOURCE } = getEnv();
  switch (CONTENT_SOURCE) {
    case "fixtures":
      return fixtureSource;
    case "webflow":
      throw new Error("The Webflow content source is not built yet (roadmap phase 1b). Use CONTENT_SOURCE=fixtures.");
  }
}

export async function getSpeakers(): Promise<Speaker[]> {
  return activeSource().getSpeakers();
}

export async function getSpeaker(slug: string): Promise<Speaker | undefined> {
  return activeSource().getSpeaker(slug);
}
