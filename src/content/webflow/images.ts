import type { ImageVariant } from "@/content/types";

// Webflow stores smaller copies of every uploaded image next to the
// original, named <name>-p-<width>.<ext>, but only for widths below the
// original's. The API does not list them and returns no image dimensions
// (decision 21), so each candidate is checked with a HEAD request on the
// public CDN. No token is sent and nothing is written.
const VARIANT_WIDTHS = [500, 800, 1080, 1600];
// Upper bound for an original wider than every variant width.
const MAX_ORIGINAL_WIDTH = 2000;
const PROBE_TIMEOUT_MS = 10_000;

export type FindImageVariants = (url: string) => Promise<ImageVariant[]>;

export function createImageVariantFinder(fetchImpl: typeof fetch = fetch): FindImageVariants {
  return async (url) => {
    const match = /^(https:\/\/cdn\.prod\.website-files\.com\/.+)(\.(?:jpe?g|png|webp))$/i.exec(url);
    if (!match) return [];
    const [, base, extension] = match;
    const exists = await Promise.all(VARIANT_WIDTHS.map((width) => variantExists(`${base}-p-${width}${extension}`, fetchImpl)));
    const firstMissing = exists.indexOf(false);
    const found = (firstMissing === -1 ? VARIANT_WIDTHS : VARIANT_WIDTHS.slice(0, firstMissing)).map((width) => ({
      url: `${base}-p-${width}${extension}`,
      width,
    }));
    if (found.length === 0) return [];
    // The original is wider than the last variant and narrower than the
    // first missing one. Listing it with that bound lets the browser pick
    // it when the variants are too small; with w descriptors, src alone
    // is never a candidate.
    return [...found, { url, width: VARIANT_WIDTHS[firstMissing] ?? MAX_ORIGINAL_WIDTH }];
  };
}

async function variantExists(url: string, fetchImpl: typeof fetch): Promise<boolean> {
  try {
    const response = await fetchImpl(url, { method: "HEAD", signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
    // The CDN answers 403 or 404 for a variant that was never generated.
    if (!response.ok && response.status !== 403 && response.status !== 404) {
      console.warn(`Image variant check: ${url} returned HTTP ${response.status}; using the original image.`);
    }
    return response.ok;
  } catch (error) {
    // A missing variant only costs bandwidth, so it must not fail the
    // build; the warning makes a CDN problem visible in the build log.
    console.warn(`Image variant check failed for ${url}; using the original image.`, error);
    return false;
  }
}
