import { describe, expect, it } from "vitest";
import { sizesFor, srcSet } from "@/components/src-set";

const image = { url: "https://cdn.example/a.jpg", alt: "Portrait of Ada" };

describe("srcSet", () => {
  it("lists every variant with its width", () => {
    const variants = [
      { url: "https://cdn.example/a-500.jpg", width: 500 },
      { url: "https://cdn.example/a.jpg", width: 800 },
    ];
    expect(srcSet({ ...image, variants })).toBe("https://cdn.example/a-500.jpg 500w, https://cdn.example/a.jpg 800w");
    expect(sizesFor({ ...image, variants }, "100vw")).toBe("100vw");
  });

  it("leaves out variants wider than maxWidth, keeping the smallest if none fits", () => {
    const variants = [
      { url: "https://cdn.example/a-500.jpg", width: 500 },
      { url: "https://cdn.example/a-800.jpg", width: 800 },
    ];
    expect(srcSet({ ...image, variants }, 500)).toBe("https://cdn.example/a-500.jpg 500w");
    expect(srcSet({ ...image, variants }, 300)).toBe("https://cdn.example/a-500.jpg 500w");
  });

  it("leaves srcset and sizes out without variants", () => {
    for (const variants of [undefined, []]) {
      expect(srcSet({ ...image, variants })).toBeUndefined();
      expect(sizesFor({ ...image, variants }, "100vw")).toBeUndefined();
    }
  });
});
