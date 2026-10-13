import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// The design system owns colors, spacing and type (decision 23). These
// checks turn the styling rules in AGENTS.md into failures, so they hold
// for every contributor, with or without a coding agent.

const files = (extension: string) =>
  readdirSync("src", { recursive: true, encoding: "utf8" })
    .filter((path) => path.endsWith(extension))
    .map((path) => join("src", path));

const lineOf = (source: string, index: number) => source.slice(0, index).split("\n").length;

type Declaration = { property: string; value: string; line: number };

function declarations(source: string): Declaration[] {
  // Comments are blanked rather than removed, so line numbers stay right.
  // At-rule preludes are skipped: breakpoints are pixel values on purpose.
  const css = source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, " "))
    .replace(/@[a-z-]+[^{;]*/g, (prelude) => prelude.replace(/[^\n]/g, " "));
  return [...css.matchAll(/([a-z-]+)\s*:\s*([^;{}]+)(?=[;}])/g)].map((match) => ({
    property: match[1]!,
    value: match[2]!.trim(),
    line: lineOf(css, match.index),
  }));
}

// Named colors: the basic set and the common extras, not all 148.
const RAW_COLOR =
  /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(|(?<![\w-])(?:black|white|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|maroon|navy|teal|aqua|cyan|fuchsia|magenta|lime|olive)(?![\w-])/i;
const LENGTH = /(?<![\w-])-?\d*\.?\d+(?:px|rem|em|pt)\b/;
// Border widths only: hairlines are 1px by design and have no token.
// Radius, offsets and spacing still come from tokens.
const MAY_USE_PIXELS = /^(?:border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?(?:-width)?|outline(?:-width)?)$/;

function violations(source: string): string[] {
  return declarations(source).flatMap(({ property, value, line }) => {
    const found: string[] = [];
    if (RAW_COLOR.test(value)) found.push(`raw color in ${property}`);
    if (LENGTH.test(value) && !MAY_USE_PIXELS.test(property)) found.push(`raw length in ${property}`);
    if (value.includes("!important")) found.push(`!important in ${property}`);
    return found.map((problem) => `line ${line}: ${problem}: ${value}`);
  });
}

describe("style checks", () => {
  it("find raw values and skip breakpoints, hairlines and comments", () => {
    const css = [
      "/* color: #fff */",
      "@media (max-width: 767px) {",
      "  .a { border-bottom: 1px solid var(--border-hairline); padding: var(--space-4); }",
      "  .b { color: #ff0000; margin: 12px 0; }",
      "}",
      ".c { background: rgb(0 0 0) !important; }",
      ".d { margin: 0 -1rem; border-radius: 8px; color: white; background: var(--bg-red-tint); }",
    ].join("\n");
    expect(violations(css)).toEqual([
      "line 4: raw color in color: #ff0000",
      "line 4: raw length in margin: 12px 0",
      "line 6: raw color in background: rgb(0 0 0) !important",
      "line 6: !important in background: rgb(0 0 0) !important",
      "line 7: raw length in margin: 0 -1rem",
      "line 7: raw length in border-radius: 8px",
      "line 7: raw color in color: white",
    ]);
  });
});

describe.each(files(".css"))("%s", (path) => {
  it("uses design system tokens instead of raw colors and lengths, without !important", () => {
    expect(violations(readFileSync(path, "utf8"))).toEqual([]);
  });
});

describe.each(files(".tsx"))("%s", (path) => {
  it("has no inline styles", () => {
    const source = readFileSync(path, "utf8");
    const lines = [...source.matchAll(/\bstyle=\{/g)].map((match) => lineOf(source, match.index));
    expect(lines, "move these styles into a CSS Module").toEqual([]);
  });
});
