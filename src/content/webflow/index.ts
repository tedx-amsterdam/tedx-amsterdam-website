import { sortEvents, sortPartners, sortSpeakers } from "@/content/sort";
import type { ContentSource } from "@/content/source";
import type { WebflowClient } from "./client";
import { EVENTS_COLLECTION_ID, mapEvent } from "./events";
import { mapPartner, PARTNERS_COLLECTION_ID } from "./partners";
import { eventItemSchema, partnerItemSchema, speakerItemSchema } from "./schemas";
import { mapSpeaker, SPEAKERS_COLLECTION_ID } from "./speakers";

export { createWebflowClient } from "./client";

// Content source backed by the live Webflow CMS. A static build asks for
// the same collection once per page, so each collection is fetched once per
// source and shared.
export function createWebflowSource(client: WebflowClient): ContentSource {
  const getSpeakers = cached(() =>
    client
      .getLiveItems(SPEAKERS_COLLECTION_ID, speakerItemSchema)
      .then((items) => sortSpeakers(items.map(mapSpeaker))),
  );

  const getEvents = cached(() =>
    client
      .getLiveItems(EVENTS_COLLECTION_ID, eventItemSchema)
      .then((items) => sortEvents(items.map(mapEvent))),
  );

  const getPartners = cached(() =>
    client
      .getLiveItems(PARTNERS_COLLECTION_ID, partnerItemSchema)
      .then((items) => sortPartners(items.map(mapPartner))),
  );

  return {
    getSpeakers,
    async getSpeaker(slug) {
      return (await getSpeakers()).find((speaker) => speaker.slug === slug);
    },
    getEvents,
    getPartners,
  };
}

// Shares one fetch between every caller. A failed fetch is not kept, so the
// dev server tries again on the next request; a build fails on the first
// error anyway.
function cached<T>(load: () => Promise<T>): () => Promise<T> {
  let value: Promise<T> | undefined;
  return () =>
    (value ??= load().catch((error: unknown) => {
      value = undefined;
      throw error;
    }));
}
