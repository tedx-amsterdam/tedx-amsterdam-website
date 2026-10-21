import { afterEach, describe, expect, it, vi } from "vitest";
import { getEvents, getImageFile, getImageFiles, getPartners, getSpeaker, getSpeakers, type Partner, type Speaker } from "@/content";
import { fixtureSource } from "@/content/fixtures";
import { sortEvents, sortPartners, sortSpeakers } from "@/content/sort";
import { createWebflowSource } from "@/content/webflow";
import type { WebflowClient } from "@/content/webflow/client";
import { EVENTS_COLLECTION_ID } from "@/content/webflow/events";
import { PARTNERS_COLLECTION_ID } from "@/content/webflow/partners";
import { eventItemSchema, itemsPageSchema, partnerItemSchema, speakerItemSchema } from "@/content/webflow/schemas";
import liveEvents from "./fixtures/webflow/events-live.json";
import livePartners from "./fixtures/webflow/partners-live.json";
import brokenPartners from "./fixtures/webflow/partners-broken.json";
import broken from "./fixtures/webflow/speakers-broken.json";
import live from "./fixtures/webflow/speakers-live.json";
import { webflowFetch } from "./support/images";

const webflowItems = itemsPageSchema(speakerItemSchema).parse(live).items;
const eventItems = itemsPageSchema(eventItemSchema).parse(liveEvents).items;
const partnerItems = itemsPageSchema(partnerItemSchema).parse(livePartners).items;
// Requests to the Webflow API, leaving out image downloads from the CDN.
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

describe("sortPartners", () => {
  const partner = (name: string, order?: number): Partner => ({ slug: name.toLowerCase(), name, status: "current", order });

  it("sorts by order, partners without an order last, ties by name", () => {
    const sorted = sortPartners([partner("Zoku"), partner("Droog", 11), partner("Busy"), partner("Dentsu", 11), partner("Zoku Two", 10)]);
    expect(sorted.map((p) => p.name)).toEqual(["Zoku Two", "Dentsu", "Droog", "Busy", "Zoku"]);
  });
});

describe("fixture source", () => {
  it("covers the partner cases pages must handle", async () => {
    const partners = await fixtureSource.getPartners();
    expect(partners).toEqual(sortPartners(partners));
    expect(new Set(partners.map((p) => p.status))).toEqual(new Set(["current", "past"]));
    expect(partners.some((p) => !p.logo)).toBe(true);
    expect(partners.some((p) => !p.url)).toBe(true);
    expect(partners.some((p) => p.order === undefined)).toBe(true);
    expect(new Set(partners.map((p) => p.order)).size).toBeLessThan(partners.length);
  });

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
    // Equal to the fixtures apart from the image copies added on top.
    const withoutCopies = (s: Speaker | undefined) => s && { ...s, photo: s.photo && { url: s.photo.url, alt: s.photo.alt } };
    expect((await getSpeakers()).map(withoutCopies)).toEqual((await fixtureSource.getSpeakers()).map(withoutCopies));
    expect(withoutCopies(await getSpeaker("lin-chen"))).toEqual(withoutCopies(await fixtureSource.getSpeaker("lin-chen")));
  });

  it("serves every image as copies made at build time (decision 29)", async () => {
    vi.stubEnv("CONTENT_SOURCE", "fixtures");
    const photos = (await getSpeakers()).flatMap((s) => (s.photo ? [s.photo] : []));
    expect(photos.length).toBeGreaterThan(0);
    for (const photo of photos) {
      expect(photo.variants?.length).toBeGreaterThan(0);
      expect(photo.shareUrl).toMatch(/^\/images\//);
    }
    const logos = (await getPartners()).flatMap((p) => (p.logo ? [p.logo] : []));
    expect(logos.length).toBeGreaterThan(0);
    for (const logo of logos) expect(logo.variants?.[0]?.url).toMatch(/^\/images\//);
    const posters = (await getEvents()).flatMap((e) => (e.image ? [e.image] : []));
    expect(posters.length).toBeGreaterThan(0);
    for (const poster of posters) expect(poster.variants?.[0]?.url).toMatch(/^\/images\//);
    const files = await getImageFiles();
    for (const url of [...photos, ...posters, ...logos].flatMap((image) => image.variants!.map((variant) => variant.url))) {
      expect(files).toContain(url.slice("/images/".length));
    }
    expect((await getImageFile(files[0]!))?.contentType).toBe("image/webp");
  });

  it("fails with a clear error when CONTENT_SOURCE is missing", async () => {
    vi.stubEnv("CONTENT_SOURCE", undefined);
    await expect(getSpeakers()).rejects.toThrow(/CONTENT_SOURCE/);
  });

  it("reads from Webflow when CONTENT_SOURCE=webflow, fetching once for every page", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    vi.stubEnv("WEBFLOW_API_TOKEN", "token");
    const fetch = vi.fn(webflowFetch(() => live));
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

  it("fails getSpeakers with the URL when a photo cannot be downloaded", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    vi.stubEnv("WEBFLOW_API_TOKEN", "missing-photo-token");
    // A URL no other test uses: the pipeline keeps the photos it already made.
    const missing = "https://cdn.prod.website-files.com/missing/photo.jpg";
    const items = live.items.map((item, i) => (i === 0 ? { ...item, fieldData: { ...item.fieldData, photo: { ...item.fieldData.photo, url: missing } } } : item));
    const photoFetch = webflowFetch(() => ({ ...live, items }));
    vi.stubGlobal("fetch", vi.fn(async (url: string) => (url === missing ? new Response("Forbidden", { status: 403 }) : photoFetch(url))));
    await expect(getSpeakers()).rejects.toThrow(`Image ${missing} could not be downloaded: HTTP 403`);
  });

  it("reads partners from Webflow with copies of every logo", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    vi.stubEnv("WEBFLOW_API_TOKEN", "partners-token");
    vi.stubGlobal("fetch", vi.fn(webflowFetch((url) => (url.includes(`/collections/${PARTNERS_COLLECTION_ID}/`) ? livePartners : live))));
    const partners = await getPartners();
    expect(partners).toHaveLength(livePartners.items.length);
    for (const partner of partners) expect(partner.logo?.variants?.[0]?.url).toMatch(/^\/images\//);
  });

  it("fails getPartners and the image list with a readable error when Webflow sends a broken partners response", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    vi.stubEnv("WEBFLOW_API_TOKEN", "broken-partners-token");
    const byCollection = (url: string) => (url.includes(`/collections/${PARTNERS_COLLECTION_ID}/`) ? brokenPartners : url.includes(`/collections/${EVENTS_COLLECTION_ID}/`) ? liveEvents : live);
    vi.stubGlobal("fetch", vi.fn(webflowFetch(byCollection)));
    await expect(getPartners()).rejects.toThrow(/does not match the expected schema[\s\S]*items\.1\.fieldData\.partner-status/);
    await expect(getImageFiles()).rejects.toThrow(/partner-status/);
  });

  it("reads events from Webflow when CONTENT_SOURCE=webflow", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    vi.stubEnv("WEBFLOW_API_TOKEN", "events-token");
    const byCollection = (url: string) => (url.includes(`/collections/${EVENTS_COLLECTION_ID}/`) ? liveEvents : live);
    vi.stubGlobal("fetch", vi.fn(webflowFetch(byCollection)));
    const events = await getEvents();
    expect(events).toHaveLength(liveEvents.items.length);
    expect(events).toEqual(sortEvents(events));
  });

  it("builds a new source when the token changes", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    const fetch = vi.fn(webflowFetch(() => live));
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
    const speakers = await createWebflowSource(client()).getSpeakers();
    expect(speakers.map((s) => s.order)).toEqual(webflowItems.map((i) => i.fieldData.order).toSorted((a, b) => a! - b!));
  });

  it("finds a speaker by slug and returns undefined for an unknown one", async () => {
    const source = createWebflowSource(client());
    expect((await source.getSpeaker("joe-wilson"))?.name).toBe("Joe Wilson");
    expect(await source.getSpeaker("nobody")).toBeUndefined();
  });

  it("tries again after a failed fetch instead of keeping the error", async () => {
    const getLiveItems = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(webflowItems);
    const source = createWebflowSource({ getLiveItems } as unknown as WebflowClient);
    await expect(source.getSpeakers()).rejects.toThrow("offline");
    expect(await source.getSpeakers()).toHaveLength(webflowItems.length);
  });

  it("returns events earliest first, fetched once", async () => {
    const getLiveItems = vi.fn(async (id: string) => (id === EVENTS_COLLECTION_ID ? eventItems : webflowItems));
    const source = createWebflowSource({ getLiveItems } as unknown as WebflowClient);
    const [events] = await Promise.all([source.getEvents(), source.getEvents()]);
    expect(events.map((e) => e.startsAt)).toEqual(eventItems.map((i) => new Date(i.fieldData["event-date"]).toISOString()).toSorted());
    expect(getLiveItems.mock.calls.filter(([id]) => id === EVENTS_COLLECTION_ID)).toHaveLength(1);
  });

  it("returns partners in display order, fetched once", async () => {
    const getLiveItems = vi.fn(async (id: string) => (id === PARTNERS_COLLECTION_ID ? partnerItems : webflowItems));
    const source = createWebflowSource({ getLiveItems } as unknown as WebflowClient);
    const [partners] = await Promise.all([source.getPartners(), source.getPartners()]);
    expect(partners).toHaveLength(partnerItems.length);
    expect(partners).toEqual(sortPartners(partners));
    // Dentsu Lab and Foodmaker share order 11: ties go by name.
    const slugs = partners.map((p) => p.slug);
    expect(slugs.indexOf("foodmaker")).toBe(slugs.indexOf("dentsu-lab") + 1);
    expect(getLiveItems.mock.calls.filter(([id]) => id === PARTNERS_COLLECTION_ID)).toHaveLength(1);
  });

  it("fetches the collection once and shares it", async () => {
    const webflow = client();
    const source = createWebflowSource(webflow);
    await Promise.all([source.getSpeakers(), source.getSpeaker("joe-wilson"), source.getSpeaker("fieke-opdam")]);
    expect(webflow.getLiveItems).toHaveBeenCalledOnce();
  });
});
