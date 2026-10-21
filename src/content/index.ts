import { getEnv } from "@/lib/env";
import { fixtureSource } from "./fixtures";
import { createImagePipeline, type ImageFile } from "./images";
import type { ContentSource } from "./source";
import type { TedxEvent, Speaker } from "./types";
import { createWebflowClient, createWebflowSource } from "./webflow";

// The only module pages and components import content from. Which source
// is active is decided here, from CONTENT_SOURCE, and nowhere else.

export { splitEvents } from "./events";
export type { TedxEvent, Image, ImageVariant, SafeHtml, Speaker } from "./types";

// One Webflow source per build process, so its fetched collections are
// shared by every page. Keyed by token, so a changed token is never served
// content fetched with another.
let webflow: { token: string; source: ContentSource } | undefined;

function activeSource(): ContentSource {
  const env = getEnv();
  switch (env.CONTENT_SOURCE) {
    case "fixtures":
      return fixtureSource;
    case "webflow":
      if (webflow?.token !== env.WEBFLOW_API_TOKEN) {
        const client = createWebflowClient({ token: env.WEBFLOW_API_TOKEN });
        webflow = { token: env.WEBFLOW_API_TOKEN, source: createWebflowSource(client) };
      }
      return webflow.source;
  }
}

// Images from every source are served as copies made at build time
// (decision 29). One pipeline per build process, so each image is
// downloaded once per process.
const images = createImagePipeline();

async function withPhotoCopies(speaker: Speaker): Promise<Speaker> {
  return speaker.photo ? { ...speaker, photo: await images.process(speaker.photo) } : speaker;
}

async function withImageCopies(event: TedxEvent): Promise<TedxEvent> {
  return event.image ? { ...event, image: await images.process(event.image) } : event;
}

export async function getSpeakers(): Promise<Speaker[]> {
  return Promise.all((await activeSource().getSpeakers()).map(withPhotoCopies));
}

export async function getSpeaker(slug: string): Promise<Speaker | undefined> {
  const speaker = await activeSource().getSpeaker(slug);
  return speaker && withPhotoCopies(speaker);
}

export async function getEvents(): Promise<TedxEvent[]> {
  return Promise.all((await activeSource().getEvents()).map(withImageCopies));
}

// File names of every image copy, for the static image route. Loads every
// collection with images first, so the list is complete in any build
// process: add a collection here when it gets images.
export async function getImageFiles(): Promise<string[]> {
  await Promise.all([getSpeakers(), getEvents()]);
  return images.files();
}

export async function getImageFile(file: string): Promise<ImageFile | undefined> {
  await getImageFiles();
  return images.render(file);
}
