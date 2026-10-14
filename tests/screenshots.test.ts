import { describe, expect, it } from "vitest";
import { MARKER, formatComment, slugFor, type Result } from "../scripts/screenshots";

describe("slugFor", () => {
  it.each([
    ["/", "home"],
    ["/speakers", "speakers"],
    ["/speakers/juan-cruz-tubio", "speakers-juan-cruz-tubio"],
  ])("names %s %s", (path, slug) => {
    expect(slugFor(path)).toBe(slug);
  });
});

describe("formatComment", () => {
  const result = (path: string, changed: boolean): Result => ({
    path,
    viewport: "desktop",
    changed,
    ratio: changed ? 0.25 : 0,
    before: `${slugFor(path)}-desktop-before.jpg`,
    after: `${slugFor(path)}-desktop-after.jpg`,
  });

  it("says so when nothing visibly changed", () => {
    const comment = formatComment([result("/", false)], "https://img");
    expect(comment.startsWith(MARKER)).toBe(true);
    expect(comment).toContain("No visible change");
    expect(comment).not.toContain("<img");
  });

  it("shows before and after for changed pages and lists the rest", () => {
    const comment = formatComment([result("/speakers", true), result("/", false)], "https://img/pr-1");
    expect(comment).toContain("1 visible change");
    expect(comment).toContain('<img src="https://img/pr-1/speakers-desktop-before.jpg"');
    expect(comment).toContain('<img src="https://img/pr-1/speakers-desktop-after.jpg"');
    expect(comment).toContain("25.0% of pixels");
    expect(comment).toContain("No visible change: `/` on desktop.");
  });
});
