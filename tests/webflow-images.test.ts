import { afterEach, describe, expect, it, vi } from "vitest";
import { createImageVariantFinder } from "@/content/webflow/images";

const CDN = "https://cdn.prod.website-files.com/6874c72679138fea0389db28/6aba71bba8d781fe9845eef5_joe%20wilson";
const status = (byWidth: Record<number, number>) =>
  vi.fn<typeof globalThis.fetch>(async (url) => new Response(null, { status: byWidth[Number(/-p-(\d+)\./.exec(String(url))?.[1])] ?? 200 }));

describe("createImageVariantFinder", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the variants that exist and the original with the next width as its bound", async () => {
    const fetch = status({ 1080: 403, 1600: 403 });
    expect(await createImageVariantFinder(fetch)(`${CDN}.jpg`)).toEqual([
      { url: `${CDN}-p-500.jpg`, width: 500 },
      { url: `${CDN}-p-800.jpg`, width: 800 },
      { url: `${CDN}.jpg`, width: 1080 },
    ]);
    expect(fetch.mock.calls.every(([, init]) => init?.method === "HEAD")).toBe(true);
  });

  it("bounds an original wider than every variant at 2000 pixels", async () => {
    const variants = await createImageVariantFinder(status({}))(`${CDN}.png`);
    expect(variants.at(-1)).toEqual({ url: `${CDN}.png`, width: 2000 });
  });

  it("returns nothing for an image narrower than the smallest variant", async () => {
    expect(await createImageVariantFinder(status({ 500: 404, 800: 404, 1080: 404, 1600: 404 }))(`${CDN}.jpg`)).toEqual([]);
  });

  it("treats a failed check as a missing variant and warns, instead of failing", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetch = vi.fn<typeof globalThis.fetch>(async () => {
      throw new TypeError("fetch failed");
    });
    expect(await createImageVariantFinder(fetch)(`${CDN}.jpg`)).toEqual([]);
    expect(warn).toHaveBeenCalled();
  });

  it("warns on unexpected status codes but not on a missing variant", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await createImageVariantFinder(status({ 1080: 404, 1600: 403 }))(`${CDN}.jpg`);
    expect(warn).not.toHaveBeenCalled();
    await createImageVariantFinder(status({ 800: 503 }))(`${CDN}.jpg`);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("does not look for variants outside the Webflow CDN or for other formats", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const find = createImageVariantFinder(fetch);
    expect(await find("https://example.com/photo.jpg")).toEqual([]);
    expect(await find(`${CDN}.svg`)).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
