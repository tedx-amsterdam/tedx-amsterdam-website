import { describe, expect, it } from "vitest";
import { MARKER, decisionChanges, dependencyChanges, fileNotes, formatComment, loweredThresholds } from "../scripts/pr-attention";

describe("dependencyChanges", () => {
  it("reports new, removed and major updated dependencies", () => {
    const notes = dependencyChanges(
      { dependencies: { next: "16.0.0", zod: "^3.24.0" }, devDependencies: { vitest: "^2.1.9" } },
      { dependencies: { next: "16.2.1", zod: "^4.0.0", sharp: "^0.34.0" }, devDependencies: {} },
    );
    expect(notes).toEqual([
      "Major update of `zod`: ^3.24.0 → ^4.0.0",
      "New dependency `sharp` ^0.34.0: is the reason in the commit message?",
      "Removed dev dependency `vitest`",
    ]);
  });

  it("stays quiet for minor and patch updates", () => {
    expect(dependencyChanges({ dependencies: { next: "16.0.0" } }, { dependencies: { next: "16.2.1" } })).toEqual([]);
  });
});

describe("loweredThresholds", () => {
  const rc = (performance: number, seo?: number) => ({
    ci: {
      assert: {
        assertions: {
          "categories:performance": ["error", { minScore: performance }] as [string, { minScore: number }],
          ...(seo === undefined ? {} : { "categories:seo": ["error", { minScore: seo }] as [string, { minScore: number }] }),
        },
      },
    },
  });

  it("reports a lowered or removed threshold", () => {
    expect(loweredThresholds(rc(0.9, 0.85), rc(0.8))).toEqual([
      "Lighthouse threshold `categories:performance` lowered from 0.9 to 0.8: thresholds only go up",
      "Lighthouse threshold `categories:seo` removed (was 0.85)",
    ]);
  });

  it("stays quiet when thresholds go up", () => {
    expect(loweredThresholds(rc(0.9, 0.85), rc(0.95, 1))).toEqual([]);
  });
});

describe("decisionChanges", () => {
  it("names added decisions from the diff", () => {
    const diff = "@@ -1 +1 @@\n+## 28. Pages use the content column (October 2026)\n+\n+Text.\n ## 27. Old";
    expect(decisionChanges(diff)).toEqual(["Decision added or retitled: **28. Pages use the content column (October 2026)**"]);
  });
});

describe("fileNotes", () => {
  it("flags files that need a person's judgment", () => {
    const notes = fileNotes([
      { status: "M", path: "docs/decisions.md" },
      { status: "M", path: "public/_headers" },
      { status: "A", path: ".github/workflows/new.yml" },
      { status: "M", path: "AGENTS.md" },
      { status: "D", path: "tests/headers.test.ts" },
      { status: "M", path: "src/app/page.tsx" },
      { status: "M", path: "docs/roadmap.md" },
    ]);
    expect(notes).toHaveLength(5);
    expect(notes.join("\n")).toMatch(/decisions\.md[\s\S]*_headers[\s\S]*new\.yml[\s\S]*AGENTS\.md[\s\S]*headers\.test\.ts/);
  });

  it("stays quiet for ordinary changes that update the roadmap", () => {
    expect(fileNotes([{ status: "M", path: "src/components/SpeakerCard.tsx" }, { status: "M", path: "docs/roadmap.md" }])).toEqual([]);
  });

  it("asks about the roadmap when code changes without it", () => {
    expect(fileNotes([{ status: "M", path: "src/components/SpeakerCard.tsx" }])).toEqual([expect.stringMatching(/roadmap\.md` not updated/)]);
    expect(fileNotes([{ status: "M", path: "docs/current-site.md" }])).toEqual([]);
  });
});

describe("formatComment", () => {
  it("starts with the marker so CI can update the same comment", () => {
    expect(formatComment([]).startsWith(MARKER)).toBe(true);
    expect(formatComment(["One"])).toContain("- One");
  });
});
