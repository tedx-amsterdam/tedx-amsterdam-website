import { afterEach, describe, expect, it, vi } from "vitest";
import { getEvents, getSpeaker, getSpeakers, type Speaker } from "@/content";
import { fixtureSource } from "@/content/fixtures";
import { sortEvents, sortSpeakers } from "@/content/sort";
import { createWebflowSource } from "@/content/webflow";
import type { WebflowClient } from "@/content/webflow/client";
import { EVENTS_COLLECTION_ID } from "@/content/webflow/events";
import { eventItemSchema, itemsPageSchema, speakerItemSchema } from "@/content/webflow/schemas";
import liveEvents from "./fixtures/webflow/events-live.json";
import broken from "./fixtures/webflow/speakers-broken.json";
import live from "./fixtures/webflow/speakers-live.json";

const webflowItems = itemsPageSchema(speakerItemSchema).parse(live).items;
const eventItems = itemsPageSchema(eventItemSchema).parse(liveEvents).items;
// Tests never reach the network: image variant checks find nothing.
const noVariants = async () => [];
// Requests to the Webflow API, leaving out image variant checks on the CDN.
const apiCalls = (fetch: { mock: { calls: unknown[][] } }) =>
  fetch.mock.calls.filter(([url]) => String(url).startsWith("https://api.webflow.com/")).length;

const speaker = (name: string, order?: number): Speaker => ({ slug: name.toLowerCase(), name, order });

describe("sortSpeakers", () => {
  it("sorts by order, speakers without an order last, ties by name", () => {
    const sorted = sortSpeakers([speaker("Zoe"), speaker("Bram", 2), speaker("Anna"), speaker("Cas", 1), speaker("Ada", 2)]);
    expect(sorted.map((s) => s.name)).toEqual(["Cas", "Ada", "Bram", "Anna", "Zoe"]);
  });

  it("does not change its input", () => {
    const input = [speaker("B", 2), speaker("A", 1)];
    sortSpeakers(input);
    expect(input.map((s) => s.name)).toEqual(["B", "A"]);
  });
});

describe("fixture source", () => {
  it("returns speakers in display order", async () => {
    const speakers = await fixtureSource.getSpeakers();
    expect(speakers.length).toBeGreaterThan(0);
    expect(speakers).toEqual(sortSpeakers(speakers));
    expect(speakers.at(-1)?.order).toBeUndefined();
  });

  it("has unique slugs that are valid URL segments", async () => {
    const slugs = (await fixtureSource.getSpeakers()).map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("covers the edge cases pages must handle", async () => {
    const speakers = await fixtureSource.getSpeakers();
    expect(speakers.some((s) => !s.photo)).toBe(true);
    expect(speakers.some((s) => s.order === undefined)).toBe(true);
    expect(speakers.some((s) => s.sessionTitle)).toBe(true);
    expect(speakers.some((s) => s.name.length > 40)).toBe(true);
  });

  it("gives every photo alt text and keeps rich text free of empty paragraphs", async () => {
    for (const s of await fixtureSource.getSpeakers()) {
      if (s.photo) expect(s.photo.alt.trim()).not.toBe("");
      for (const html of [s.bio, s.sessionBlurb]) expect(html ?? "").not.toMatch(/<p>[\s\u200d\u00a0]*<\/p>|&nbsp;<\/p>/);
    }
  });

  it("finds a speaker by slug", async () => {
    expect((await fixtureSource.getSpeaker("amara-okafor"))?.name).toBe("Amara Okafor");
    expect(await fixtureSource.getSpeaker("nobody")).toBeUndefined();
  });
});

describe("@/content", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("reads from the fixture source when CONTENT_SOURCE=fixtures", async () => {
    vi.stubEnv("CONTENT_SOURCE", "fixtures");
    expect(await getSpeakers()).toEqual(await fixtureSource.getSpeakers());
    expect(await getSpeaker("lin-chen")).toEqual(await fixtureSource.getSpeaker("lin-chen"));
  });

  it("fails with a clear error when CONTENT_SOURCE is missing", async () => {
    vi.stubEnv("CONTENT_SOURCE", undefined);
    await expect(getSpeakers()).rejects.toThrow(/CONTENT_SOURCE/);
  });

  it("reads from Webflow when CONTENT_SOURCE=webflow, fetching once for every page", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    vi.stubEnv("WEBFLOW_API_TOKEN", "token");
    const fetch = vi.fn<typeof globalThis.fetch>(async () => new Response(JSON.stringify(live)));
    vi.stubGlobal("fetch", fetch);
    const speakers = await getSpeakers();
    expect(speakers).toHaveLength(live.items.length);
    expect(speakers).toEqual(sortSpeakers(speakers));
    expect((await getSpeaker("fieke-opdam"))?.name).toBe("Fieke Opdam");
    expect(apiCalls(fetch)).toBe(1);
  });

  it("fails getSpeakers with a readable error when Webflow sends a broken response", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    // A token no other test uses, so no cached source from another test answers.
    vi.stubEnv("WEBFLOW_API_TOKEN", "broken-response-token");
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(broken))));
    await expect(getSpeakers()).rejects.toThrow(/does not match the expected schema[\s\S]*items\.1\.fieldData\.name/);
    await expect(getSpeaker("joe-wilson")).rejects.toThrow(/does not match the expected schema/);
  });

  it("reads events from Webflow when CONTENT_SOURCE=webflow", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    vi.stubEnv("WEBFLOW_API_TOKEN", "events-token");
    const byCollection = (url: string) => (url.includes(`/collections/${EVENTS_COLLECTION_ID}/`) ? liveEvents : live);
    vi.stubGlobal("fetch", vi.fn(async (url: string) => new Response(JSON.stringify(byCollection(String(url))))));
    const events = await getEvents();
    expect(events).toHaveLength(liveEvents.items.length);
    expect(events).toEqual(sortEvents(events));
  });

  it("builds a new source when the token changes", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    const fetch = vi.fn(async () => new Response(JSON.stringify(live)));
    vi.stubGlobal("fetch", fetch);
    vi.stubEnv("WEBFLOW_API_TOKEN", "token-a");
    await getSpeakers();
    vi.stubEnv("WEBFLOW_API_TOKEN", "token-b");
    await getSpeakers();
    expect(apiCalls(fetch)).toBe(2);
  });
});

describe("Webflow source", () => {
  const client = (items = webflowItems): WebflowClient => ({ getLiveItems: vi.fn(async () => items) as WebflowClient["getLiveItems"] });

  it("returns speakers in display order, lowest order first", async () => {
    const speakers = await createWebflowSource(client(), noVariants).getSpeakers();
    expect(speakers.map((s) => s.order)).toEqual(webflowItems.map((i) => i.fieldData.order).toSorted((a, b) => a! - b!));
  });

  it("finds a speaker by slug and returns undefined for an unknown one", async () => {
    const source = createWebflowSource(client(), noVariants);
    expect((await source.getSpeaker("joe-wilson"))?.name).toBe("Joe Wilson");
    expect(await source.getSpeaker("nobody")).toBeUndefined();
  });

  it("tries again after a failed fetch instead of keeping the error", async () => {
    const getLiveItems = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(webflowItems);
    const source = createWebflowSource({ getLiveItems } as unknown as WebflowClient, noVariants);
    await expect(source.getSpeakers()).rejects.toThrow("offline");
    expect(await source.getSpeakers()).toHaveLength(webflowItems.length);
  });

  it("adds the image variants Webflow has for each photo", async () => {
    const findVariants = vi.fn(async (url: string) => [{ url: url.replace(/\.jpg$/, "-p-500.jpg"), width: 500 }]);
    const joe = await createWebflowSource(client(), findVariants).getSpeaker("joe-wilson");
    expect(joe?.photo?.variants).toEqual([{ url: joe!.photo!.url.replace(/\.jpg$/, "-p-500.jpg"), width: 500 }]);
    expect(findVariants).toHaveBeenCalledTimes(webflowItems.filter((i) => i.fieldData.photo).length);
  });

  it("returns events earliest first, fetched once", async () => {
    const getLiveItems = vi.fn(async (id: string) => (id === EVENTS_COLLECTION_ID ? eventItems : webflowItems));
    const source = createWebflowSource({ getLiveItems } as unknown as WebflowClient, noVariants);
    const [events] = await Promise.all([source.getEvents(), source.getEvents()]);
    expect(events.map((e) => e.startsAt)).toEqual(eventItems.map((i) => new Date(i.fieldData["event-date"]).toISOString()).toSorted());
    expect(getLiveItems.mock.calls.filter(([id]) => id === EVENTS_COLLECTION_ID)).toHaveLength(1);
  });

  it("adds image variants to event images too", async () => {
    const withImage = { ...eventItems[0]!, fieldData: { ...eventItems[0]!.fieldData, image: { url: "https://cdn.example/poster.jpg", alt: null } } };
    const getLiveItems = vi.fn(async (id: string) => (id === EVENTS_COLLECTION_ID ? [withImage] : webflowItems));
    const findVariants = vi.fn(async () => [{ url: "https://cdn.example/poster-p-500.jpg", width: 500 }]);
    const [event] = await createWebflowSource({ getLiveItems } as unknown as WebflowClient, findVariants).getEvents();
    expect(event?.image?.variants).toEqual([{ url: "https://cdn.example/poster-p-500.jpg", width: 500 }]);
    expect(findVariants).toHaveBeenCalledExactlyOnceWith("https://cdn.example/poster.jpg");
  });

  it("fetches the collection once and shares it", async () => {
    const webflow = client();
    const source = createWebflowSource(webflow, noVariants);
    await Promise.all([source.getSpeakers(), source.getSpeaker("joe-wilson"), source.getSpeaker("fieke-opdam")]);
    expect(webflow.getLiveItems).toHaveBeenCalledOnce();
  });
});
