import { getEnv } from "@/lib/env";
import { fixtureSource } from "./fixtures";
import type { ContentSource } from "./source";
import type { Speaker } from "./types";
import { createWebflowClient, createWebflowSource } from "./webflow";

// The only module pages and components import content from. Which source
// is active is decided here, from CONTENT_SOURCE, and nowhere else.

export type { Image, SafeHtml, Speaker } from "./types";

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

export async function getSpeakers(): Promise<Speaker[]> {
  return activeSource().getSpeakers();
}

export async function getSpeaker(slug: string): Promise<Speaker | undefined> {
  return activeSource().getSpeaker(slug);
}
