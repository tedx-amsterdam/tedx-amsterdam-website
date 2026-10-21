import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import { createImagePipeline } from "@/content/images";
import { PHOTO } from "./support/images";

const URL_A = "https://cdn.example/a.jpg";

const pipelineFor = (respond: (url: string) => Response | Promise<Response>) => {
  const fetch = vi.fn(async (url: string | URL | Request) => respond(String(url)));
  return { fetch, pipeline: createImagePipeline(() => fetch as unknown as typeof globalThis.fetch) };
};

const jpeg = (width: number, height: number) =>
  sharp({ create: { width, height, channels: 3, background: "#888888" } }).jpeg().toBuffer();

const fileOf = (url: string) => url.replace(/^\/images\//, "");

describe("createImagePipeline", () => {
  it("lists WebP copies below the original's width, capped at 1600, and a JPEG to share", async () => {
    const { pipeline } = pipelineFor(() => new Response(new Uint8Array(PHOTO)));
    const image = await pipeline.process({ url: URL_A, alt: "Portrait of Ada" });
    expect(image.url).toBe(URL_A);
    expect(image.alt).toBe("Portrait of Ada");
    expect(image.variants?.map((variant) => variant.width)).toEqual([500, 800, 1080, 1365]);
    for (const variant of image.variants ?? []) expect(variant.url).toMatch(/^\/images\/[0-9a-f]{16}-\d+\.webp$/);
    expect(image.shareUrl).toMatch(/^\/images\/[0-9a-f]{16}-1080\.jpg$/);
    expect(pipeline.files()).toHaveLength(5);
  });

  it("never lists a copy wider than a small original", async () => {
    const small = await jpeg(300, 200);
    const { pipeline } = pipelineFor(() => new Response(new Uint8Array(small)));
    const image = await pipeline.process({ url: URL_A, alt: "" });
    expect(image.variants?.map((variant) => variant.width)).toEqual([300]);
    expect(image.shareUrl).toMatch(/-300\.jpg$/);
  });

  it("caps the widest copy at 1600 for a large original", async () => {
    const large = await jpeg(2400, 1600);
    const { pipeline } = pipelineFor(() => new Response(new Uint8Array(large)));
    const image = await pipeline.process({ url: URL_A, alt: "" });
    expect(image.variants?.map((variant) => variant.width)).toEqual([500, 800, 1080, 1600]);
  });

  it("renders each copy at its width and format", async () => {
    const { pipeline } = pipelineFor(() => new Response(new Uint8Array(PHOTO)));
    const image = await pipeline.process({ url: URL_A, alt: "" });
    const webp = await pipeline.render(fileOf(image.variants![1]!.url));
    expect(webp?.contentType).toBe("image/webp");
    expect(await sharp(webp!.body).metadata()).toMatchObject({ format: "webp", width: 800 });
    const share = await pipeline.render(fileOf(image.shareUrl!));
    expect(share?.contentType).toBe("image/jpeg");
    expect(await sharp(share!.body).metadata()).toMatchObject({ format: "jpeg", width: 1080 });
  });

  it("downloads each image once, however often it is processed and rendered", async () => {
    const { fetch, pipeline } = pipelineFor(() => new Response(new Uint8Array(PHOTO)));
    const [image] = await Promise.all([pipeline.process({ url: URL_A, alt: "One" }), pipeline.process({ url: URL_A, alt: "Two" })]);
    await pipeline.render(fileOf(image.variants![0]!.url));
    expect(fetch).toHaveBeenCalledOnce();
    // The same image in two places keeps the alt text of each.
    expect((await pipeline.process({ url: URL_A, alt: "Three" })).alt).toBe("Three");
  });

  it("names copies after the image's content, so a file replaced at the same URL gets new names", async () => {
    const before = await pipelineFor(() => new Response(new Uint8Array(PHOTO))).pipeline.process({ url: URL_A, alt: "" });
    const replaced = await jpeg(1365, 2048).then((other) => sharp(other).modulate({ brightness: 1.2 }).jpeg().toBuffer());
    const after = await pipelineFor(() => new Response(new Uint8Array(replaced))).pipeline.process({ url: URL_A, alt: "" });
    expect(after.variants![0]!.url).not.toBe(before.variants![0]!.url);
    // Another build of the same content gives the same names.
    const again = await pipelineFor(() => new Response(new Uint8Array(PHOTO))).pipeline.process({ url: URL_A, alt: "" });
    expect(again.variants).toEqual(before.variants);
  });

  it("returns undefined for a file it never made", async () => {
    const { pipeline } = pipelineFor(() => new Response(new Uint8Array(PHOTO)));
    expect(await pipeline.render("0123456789abcdef-500.webp")).toBeUndefined();
  });

  it("fails with the URL when an image cannot be downloaded, and tries again next time", async () => {
    let status = 403;
    const { pipeline } = pipelineFor(() => new Response(status === 200 ? new Uint8Array(PHOTO) : "Forbidden", { status }));
    await expect(pipeline.process({ url: URL_A, alt: "" })).rejects.toThrow(`Image ${URL_A} could not be downloaded: HTTP 403`);
    status = 200;
    expect((await pipeline.process({ url: URL_A, alt: "" })).variants).toHaveLength(4);
  });

  it("fails with the URL when the network fails", async () => {
    const { pipeline } = pipelineFor(() => Promise.reject(new TypeError("fetch failed")));
    await expect(pipeline.process({ url: URL_A, alt: "" })).rejects.toThrow(`Image ${URL_A} could not be downloaded`);
  });

  it("fails with the URL when a download is not an image", async () => {
    const { pipeline } = pipelineFor(() => new Response("<html>Not an image</html>"));
    await expect(pipeline.process({ url: URL_A, alt: "" })).rejects.toThrow(`Image ${URL_A} could not be decoded`);
  });

  it("uses the width as shown for a photo rotated in its EXIF data", async () => {
    const rotated = await sharp({ create: { width: 2048, height: 1365, channels: 3, background: "#888888" } })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    const { pipeline } = pipelineFor(() => new Response(new Uint8Array(rotated)));
    const image = await pipeline.process({ url: URL_A, alt: "" });
    expect(image.variants?.at(-1)?.width).toBe(1365);
    const widest = await pipeline.render(fileOf(image.variants!.at(-1)!.url));
    expect((await sharp(widest!.body).metadata()).width).toBe(1365);
  });

  it("processes the inline SVG images of the fixtures", async () => {
    const svg = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500"/></svg>');
    const image = await createImagePipeline().process({ url: svg, alt: "" });
    expect(image.variants?.map((variant) => variant.width)).toEqual([400]);
  });
});
