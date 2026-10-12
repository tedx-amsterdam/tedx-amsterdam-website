import { sortEvents, sortSpeakers } from "@/content/sort";
import type { ContentSource } from "@/content/source";
import type { TedxEvent, Image, Speaker } from "@/content/types";
import type { WebflowClient } from "./client";
import { EVENTS_COLLECTION_ID, mapEvent } from "./events";
import { createImageVariantFinder, type FindImageVariants } from "./images";
import { eventItemSchema, speakerItemSchema } from "./schemas";
import { mapSpeaker, SPEAKERS_COLLECTION_ID } from "./speakers";

export { createWebflowClient } from "./client";

// Content source backed by the live Webflow CMS. A static build asks for
// the same collection once per page, so each collection is fetched once per
// source and shared.
export function createWebflowSource(
  client: WebflowClient,
  findImageVariants: FindImageVariants = createImageVariantFinder(),
): ContentSource {
  const withVariants = async (image: Image | undefined) =>
    image && { ...image, variants: await findImageVariants(image.url) };

  const getSpeakers = cached(() =>
    client
      .getLiveItems(SPEAKERS_COLLECTION_ID, speakerItemSchema)
      .then((items) =>
        Promise.all(items.map(mapSpeaker).map(async (speaker): Promise<Speaker> => ({ ...speaker, photo: await withVariants(speaker.photo) }))),
      )
      .then(sortSpeakers),
  );

  const getEvents = cached(() =>
    client
      .getLiveItems(EVENTS_COLLECTION_ID, eventItemSchema)
      .then((items) => Promise.all(items.map(mapEvent).map(async (event): Promise<TedxEvent> => ({ ...event, image: await withVariants(event.image) }))))
      .then(sortEvents),
  );

  return {
    getSpeakers,
    async getSpeaker(slug) {
      return (await getSpeakers()).find((speaker) => speaker.slug === slug);
    },
    getEvents,
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
