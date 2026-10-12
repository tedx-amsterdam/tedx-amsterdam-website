import { describe, expect, it, vi } from "vitest";
import { createWebflowClient } from "@/content/webflow/client";
import { EVENTS_COLLECTION_ID, mapEvent } from "@/content/webflow/events";
import { eventItemSchema, itemsPageSchema, type WebflowEventItem } from "@/content/webflow/schemas";
import broken from "./fixtures/webflow/events-broken.json";
import live from "./fixtures/webflow/events-live.json";

const liveItems = itemsPageSchema(eventItemSchema).parse(live).items;
const raw = (slug: string) => live.items.find((item) => item.fieldData.slug === slug)!.fieldData;
const mapped = (slug: string) => mapEvent(liveItems.find((item) => item.fieldData.slug === slug)!);
const someSlug = live.items.find((item) => item.fieldData.location !== item.fieldData.location.trim())!.fieldData.slug;

const item = (fieldData: Partial<WebflowEventItem["fieldData"]>): WebflowEventItem => ({
  id: "1",
  fieldData: { name: "Open Mic", slug: "open-mic", "event-date": "2026-06-25T18:00:00.000Z", ...fieldData },
});

describe("Webflow events on the recorded response", () => {
  it("parses and maps every published event", () => {
    expect(liveItems).toHaveLength(live.items.length);
    for (const event of liveItems.map(mapEvent)) {
      expect(event.title).toBe(event.title.trim());
      expect(new Date(event.startsAt).toISOString()).toBe(event.startsAt);
    }
  });

  it("takes the date from event-date and ignores the free text date field", () => {
    const fields = live.items[0]!.fieldData;
    const event = mapEvent(liveItems[0]!);
    expect(event.startsAt).toBe(new Date(fields["event-date"]).toISOString());
    expect(JSON.stringify(event)).not.toContain(fields.date);
  });

  it("trims the location", () => {
    expect(mapped(someSlug).location).toBe(raw(someSlug).location.trim());
  });

  it("reads the description from the misspelled descpiption field", () => {
    expect(mapped(someSlug).description).toBe(raw(someSlug).descpiption.trim());
  });

  it("keeps the ticket or event link unchanged", () => {
    expect(mapped(someSlug).url).toBe(raw(someSlug).link);
  });

  it("does not filter on show-hide", () => {
    expect(live.items.some((i) => !i.fieldData["show-hide"])).toBe(true);
    expect(liveItems.map(mapEvent)).toHaveLength(live.items.length);
  });
});

describe("mapEvent", () => {
  it("maps an event with only the required fields", () => {
    expect(mapEvent(item({}))).toEqual({
      slug: "open-mic",
      title: "Open Mic",
      startsAt: "2026-06-25T18:00:00.000Z",
      location: undefined,
      description: undefined,
      url: undefined,
      tag: undefined,
      image: undefined,
    });
  });

  it("normalises a date with an offset to UTC", () => {
    expect(mapEvent(item({ "event-date": "2026-06-25T20:00:00+02:00" })).startsAt).toBe("2026-06-25T18:00:00.000Z");
  });

  it("falls back to the title when the image has no alt text", () => {
    expect(mapEvent(item({ image: { url: "https://cdn.example/poster.jpg", alt: null } })).image).toEqual({
      url: "https://cdn.example/poster.jpg",
      alt: "Open Mic",
    });
  });

  it("treats blank text as empty", () => {
    expect(mapEvent(item({ tag: " ", location: "  " }))).toMatchObject({ tag: undefined, location: undefined });
  });
});

describe("event schema", () => {
  it("treats a cleared link as no link", () => {
    expect(mapEvent(eventItemSchema.parse(item({ link: "" as never }))).url).toBeUndefined();
  });

  it("accepts http links and trims the link", () => {
    expect(mapEvent(eventItemSchema.parse(item({ link: "http://example.com/tickets" }))).url).toBe("http://example.com/tickets");
    expect(mapEvent(eventItemSchema.parse(item({ link: " https://example.com/tickets " }))).url).toBe("https://example.com/tickets");
  });

  it("fails on an event whose date is cleared or was never set", () => {
    expect(eventItemSchema.safeParse(item({ "event-date": null as never })).success).toBe(false);
    const { "event-date": _, ...withoutDate } = item({}).fieldData;
    expect(eventItemSchema.safeParse({ id: "1", fieldData: withoutDate }).success).toBe(false);
  });

  it("rejects a link that is not http or https", () => {
    expect(eventItemSchema.safeParse(item({ link: "javascript:alert(1)" })).success).toBe(false);
  });

  it("fails with a readable error that names the event with a broken date", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(JSON.stringify(broken)));
    const client = createWebflowClient({ token: "t", fetch });
    await expect(client.getLiveItems(EVENTS_COLLECTION_ID, eventItemSchema)).rejects.toThrow(
      new RegExp(`- items\\.1\\.fieldData\\.event-date \\(item ${broken.items[1]!.fieldData.slug}\\): `),
    );
  });
});
