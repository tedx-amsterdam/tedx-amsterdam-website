import type { Image } from "@/content";

// srcset from the image's variants, or undefined so the browser uses src.
// maxWidth leaves out larger variants (keeping the smallest if none fits),
// for images where a softer photo is worth fewer bytes.
export function srcSet(image: Image, maxWidth = Infinity): string | undefined {
  if (!image.variants?.length) return undefined;
  const fitting = image.variants.filter((variant) => variant.width <= maxWidth);
  const variants = fitting.length > 0 ? fitting : [image.variants.reduce((a, b) => (b.width < a.width ? b : a))];
  return variants.map((variant) => `${variant.url} ${variant.width}w`).join(", ");
}

// sizes only means something next to a srcset; on its own it is invalid HTML.
export function sizesFor(image: Image, sizes: string): string | undefined {
  return image.variants?.length ? sizes : undefined;
}
