import { createHash } from "node:crypto";
import sharp from "sharp";
import type { Image } from "./types";

// Every CMS image is downloaded once per build process and served as smaller copies
// from our own domain (decision 29): WebP at fixed widths for srcset, and one
// JPEG for link previews. This works on domain images, so it does not depend
// on which CMS the content comes from.

const WIDTHS = [500, 800, 1080, 1600];
const SHARE_WIDTH = 1080;
const ENCODING = { webp: { quality: 75 }, jpeg: { quality: 80, mozjpeg: true } } as const;
const DOWNLOAD_TIMEOUT_MS = 30_000;
// Served by src/app/images/[file]/route.ts.
const IMAGE_PATH = "/images/";

type Copy = { source: string; hash: string; width: number; format: "webp" | "jpeg" };

export type ImageFile = { body: Uint8Array<ArrayBuffer>; contentType: string };

export type ImagePipeline = {
  // The image with variants and a share image that point at local copies.
  // Throws, naming the URL, when the image cannot be downloaded or decoded.
  process(image: Image): Promise<Image>;
  // File names of every copy of the images processed so far.
  files(): string[];
  // A copy by file name, or undefined for a name that was never processed.
  render(file: string): Promise<ImageFile | undefined>;
};

export function createImagePipeline(fetchImpl: () => typeof fetch = () => fetch): ImagePipeline {
  const originals = new Map<string, Promise<Buffer>>();
  const processed = new Map<string, Promise<Image>>();
  const copies = new Map<string, Copy>();

  const download = (url: string) => {
    let original = originals.get(url);
    if (!original) {
      original = downloadImage(url, fetchImpl());
      // A failed download is not kept, so the dev server tries again.
      original.catch(() => originals.delete(url));
      originals.set(url, original);
    }
    return original;
  };

  const register = (copy: Copy) => {
    const file = fileName(copy);
    copies.set(file, copy);
    return `${IMAGE_PATH}${file}`;
  };

  return {
    process(image) {
      let result = processed.get(image.url);
      if (!result) {
        result = download(image.url).then(async (original) => {
          const width = await originalWidth(image.url, original);
          const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, WIDTHS.at(-1)!)])];
          const copy = { source: image.url, hash: contentHash(original) };
          return {
            ...image,
            variants: widths.map((w) => ({ url: register({ ...copy, width: w, format: "webp" }), width: w })),
            shareUrl: register({ ...copy, width: Math.min(width, SHARE_WIDTH), format: "jpeg" }),
          };
        });
        result.catch(() => processed.delete(image.url));
        processed.set(image.url, result);
      }
      return result.then((done) => ({ ...done, alt: image.alt }));
    },
    files: () => [...copies.keys()],
    async render(file) {
      const copy = copies.get(file);
      if (!copy) return undefined;
      const resized = sharp(await download(copy.source)).rotate().resize({ width: copy.width });
      try {
        const body = copy.format === "webp" ? await resized.webp(ENCODING.webp).toBuffer() : await resized.jpeg(ENCODING.jpeg).toBuffer();
        return { body: new Uint8Array(body), contentType: `image/${copy.format}` };
      } catch (error) {
        throw new Error(`Image ${describe(copy.source)} could not be converted`, { cause: error });
      }
    },
  };
}

// The copies are cached for a year, so the name changes whenever the output
// would: it hashes the original's bytes and the encoding settings, not the
// URL, which a CMS may keep when a file is replaced. The width is there for
// anyone reading the HTML.
function contentHash(original: Buffer): string {
  return createHash("sha256").update(original).update(JSON.stringify(ENCODING)).digest("hex").slice(0, 16);
}

function fileName({ hash, width, format }: Copy): string {
  return `${hash}-${width}.${format === "webp" ? "webp" : "jpg"}`;
}

async function downloadImage(url: string, fetchImpl: typeof fetch): Promise<Buffer> {
  let response: Response;
  let body: ArrayBuffer;
  try {
    // The timeout also covers reading the body.
    response = await fetchImpl(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
    body = await response.arrayBuffer();
  } catch (error) {
    throw new Error(`Image ${describe(url)} could not be downloaded`, { cause: error });
  }
  if (!response.ok) throw new Error(`Image ${describe(url)} could not be downloaded: HTTP ${response.status}`);
  return Buffer.from(body);
}

// Width as shown, after the rotation in the EXIF data.
async function originalWidth(url: string, original: Buffer): Promise<number> {
  try {
    const { width, height, orientation } = await sharp(original).metadata();
    return orientation !== undefined && orientation >= 5 ? height : width;
  } catch (error) {
    throw new Error(`Image ${describe(url)} could not be decoded`, { cause: error });
  }
}

// Data URLs (the fixtures) are long and say nothing; the start is enough.
function describe(url: string): string {
  return url.startsWith("data:") ? `${url.slice(0, 40)}…` : url;
}
