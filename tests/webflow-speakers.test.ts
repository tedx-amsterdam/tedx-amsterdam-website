import { describe, expect, it, vi } from "vitest";
import { createWebflowClient } from "@/content/webflow/client";
import { itemsPageSchema, speakerItemSchema, type WebflowSpeakerItem } from "@/content/webflow/schemas";
import { mapSpeaker, SPEAKERS_COLLECTION_ID } from "@/content/webflow/speakers";
import broken from "./fixtures/webflow/speakers-broken.json";
import live from "./fixtures/webflow/speakers-live.json";

const liveItems = itemsPageSchema(speakerItemSchema).parse(live).items;
const rawFields = (slug: string) => live.items.find((item) => item.fieldData.slug === slug)!.fieldData;
const mapped = (slug: string) => mapSpeaker(liveItems.find((item) => item.fieldData.slug === slug)!);

const item = (fieldData: Partial<WebflowSpeakerItem["fieldData"]>): WebflowSpeakerItem => ({
  id: "1",
  fieldData: { name: "Ada Lovelace", slug: "ada-lovelace", ...fieldData },
});

describe("Webflow speakers on the recorded response", () => {
  it("parses and maps every published speaker", () => {
    expect(liveItems).toHaveLength(9);
    for (const speaker of liveItems.map(mapSpeaker)) {
      expect(speaker.name).toBe(speaker.name.trim());
      expect(speaker.name).not.toBe("");
      expect(speaker.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("does not filter on show-hide-speaker", () => {
    expect(live.items.some((i) => !i.fieldData["show-hide-speaker"])).toBe(true);
    expect(liveItems.map(mapSpeaker)).toHaveLength(live.items.length);
  });

  it("takes the name from name, trimmed, when name-of-speaker is empty", () => {
    expect(rawFields("fieke-opdam")).toMatchObject({ "name-of-speaker": null, name: "Fieke Opdam " });
    expect(mapped("fieke-opdam").name).toBe("Fieke Opdam");
  });

  it("gives 2026 speakers no session title, also when both name fields are filled", () => {
    expect(rawFields("joe-wilson")["name-of-speaker"]).toBe("Joe Wilson");
    expect(liveItems.map(mapSpeaker).filter((s) => s.sessionTitle)).toEqual([]);
  });

  it("falls back to the speaker name when a photo has no alt text", () => {
    expect(rawFields("joe-wilson").photo.alt).toBeNull();
    expect(mapped("joe-wilson").photo).toEqual({ url: rawFields("joe-wilson").photo.url, alt: "Joe Wilson" });
  });

  it("drops paragraphs that hold only a zero width joiner", () => {
    const withJoiner = live.items.filter((i) => `${i.fieldData["session-blurb-2"]}${i.fieldData["speaker-bio-2"]}`.includes("‍"));
    expect(withJoiner.length).toBeGreaterThan(0);
    for (const { fieldData } of withJoiner) {
      const speaker = mapped(fieldData.slug);
      expect(`${speaker.sessionBlurb}${speaker.bio}`).not.toMatch(/<p>[\s​-‍⁠﻿]*<\/p>/);
    }
  });

  it("maps the optional plain text fields, leaving empty ones out", () => {
    const winners = liveItems.map(mapSpeaker).filter((s) => s.tedxRole);
    expect(winners.length).toBeGreaterThan(0);
    expect(winners.every((s) => s.tedxRole === s.tedxRole?.trim())).toBe(true);
    expect(liveItems.map(mapSpeaker).every((s) => s.pronouns === undefined)).toBe(true);
    expect(mapped("joe-wilson").role).toBe(rawFields("joe-wilson").occupation);
  });
});

describe("mapSpeaker", () => {
  it("uses name as the session title for 2025 items, where name-of-speaker holds the speaker", () => {
    const speaker = mapSpeaker(item({ name: "The quiet economy ", "name-of-speaker": " Ada Lovelace" }));
    expect(speaker).toMatchObject({ name: "Ada Lovelace", sessionTitle: "The quiet economy" });
  });

  it("keeps alt text from Webflow when there is one", () => {
    const speaker = mapSpeaker(item({ photo: { url: "https://cdn.example/ada.jpg", alt: "Ada on stage" } }));
    expect(speaker.photo).toEqual({ url: "https://cdn.example/ada.jpg", alt: "Ada on stage" });
  });

  it("maps an item with only the required fields", () => {
    expect(mapSpeaker(item({}))).toEqual({
      slug: "ada-lovelace",
      name: "Ada Lovelace",
      sessionTitle: undefined,
      role: undefined,
      tedxRole: undefined,
      pronouns: undefined,
      sessionBlurb: undefined,
      bio: undefined,
      photo: undefined,
      order: undefined,
    });
  });

  it("sanitises rich text and leaves out rich text that is empty after sanitising", () => {
    const speaker = mapSpeaker(item({ "session-blurb-2": '<p>Hi<script>alert(1)</script></p>', "speaker-bio-2": "<p>‍</p>" }));
    expect(speaker.sessionBlurb).toBe("<p>Hi</p>");
    expect(speaker.bio).toBeUndefined();
  });

  it("leaves out an empty order, so the speaker sorts last", () => {
    expect(mapSpeaker(item({ order: null })).order).toBeUndefined();
  });

  it("falls back to the name when alt text is blank", () => {
    expect(mapSpeaker(item({ photo: { url: "https://cdn.example/ada.jpg", alt: " " } })).photo?.alt).toBe("Ada Lovelace");
  });

  it("treats whitespace only text as empty", () => {
    expect(mapSpeaker(item({ "name-of-speaker": "  ", occupation: " " }))).toMatchObject({ name: "Ada Lovelace", role: undefined });
  });
});

describe("speaker schema", () => {
  it("fails with a readable error that names the broken field", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(JSON.stringify(broken)));
    const client = createWebflowClient({ token: "t", fetch });
    await expect(client.getLiveItems(SPEAKERS_COLLECTION_ID, speakerItemSchema)).rejects.toThrow(
      /does not match the expected schema[\s\S]*- items\.1\.fieldData\.name \(item dr-lucy-van-de-wiel\): /,
    );
  });

  it("only accepts https image URLs", () => {
    for (const url of ["http://cdn.example/a.jpg", "javascript:alert(1)"]) {
      expect(speakerItemSchema.safeParse(item({ photo: { url, alt: null } })).success).toBe(false);
    }
  });

  it("rejects a slug that is not a valid URL segment", () => {
    const result = speakerItemSchema.safeParse(item({ slug: "Ada Lovelace" }));
    expect(result.error?.issues[0]).toMatchObject({ path: ["fieldData", "slug"], message: "must be a lowercase URL segment" });
  });
});
