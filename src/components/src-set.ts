import type { Image } from "@/content";

// srcset from the image's variants, or undefined so the browser uses src.
export function srcSet(image: Image): string | undefined {
  return image.variants?.length ? image.variants.map((variant) => `${variant.url} ${variant.width}w`).join(", ") : undefined;
}

// sizes only means something next to a srcset; on its own it is invalid HTML.
export function sizesFor(image: Image, sizes: string): string | undefined {
  return image.variants?.length ? sizes : undefined;
}
