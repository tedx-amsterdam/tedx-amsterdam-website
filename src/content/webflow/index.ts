import { sortSpeakers } from "@/content/sort";
import type { ContentSource } from "@/content/source";
import type { Speaker } from "@/content/types";
import type { WebflowClient } from "./client";
import { speakerItemSchema } from "./schemas";
import { mapSpeaker, SPEAKERS_COLLECTION_ID } from "./speakers";

export { createWebflowClient } from "./client";

// Content source backed by the live Webflow CMS. A static build asks for
// the same speakers once per page, so each collection is fetched once per
// source and shared. A failed fetch is not kept, so the dev server tries
// again on the next request; a build fails on the first error anyway.
export function createWebflowSource(client: WebflowClient): ContentSource {
  let speakers: Promise<Speaker[]> | undefined;
  const getSpeakers = () =>
    (speakers ??= client
      .getLiveItems(SPEAKERS_COLLECTION_ID, speakerItemSchema)
      .then((items) => sortSpeakers(items.map(mapSpeaker)))
      .catch((error: unknown) => {
        speakers = undefined;
        throw error;
      }));

  return {
    getSpeakers,
    async getSpeaker(slug) {
      return (await getSpeakers()).find((speaker) => speaker.slug === slug);
    },
  };
}
