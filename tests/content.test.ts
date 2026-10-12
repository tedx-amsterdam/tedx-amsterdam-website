import { afterEach, describe, expect, it, vi } from "vitest";
import { getSpeaker, getSpeakers, type Speaker } from "@/content";
import { fixtureSource } from "@/content/fixtures";
import { sortSpeakers } from "@/content/sort";

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

  it("says the Webflow source is not built yet", async () => {
    vi.stubEnv("CONTENT_SOURCE", "webflow");
    vi.stubEnv("WEBFLOW_API_TOKEN", "token");
    await expect(getSpeakers()).rejects.toThrow(/phase 1b/);
  });
});
