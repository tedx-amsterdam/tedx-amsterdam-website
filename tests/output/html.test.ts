import { describe, expect, it } from "vitest";
import { htmlPages, outFileExists } from "./build";

// Each check links to its requirement in The Website Specification.
// See docs/website-spec.md for the full mapping.
const SPEC = "https://specification.website/spec";

const pages = htmlPages();

describe("build output", () => {
  it("contains pages", () => {
    expect(pages.length).toBeGreaterThan(0);
  });

  it(`has a custom 404 page (${SPEC}/resilience/error-pages/)`, () => {
    expect(outFileExists("404.html")).toBe(true);
  });
});

describe.each(pages)("$path", ({ source, document }) => {
  it(`starts with the HTML doctype (${SPEC}/foundations/doctype/)`, () => {
    expect(source.trimStart().toLowerCase()).toMatch(/^<!doctype html>/);
  });

  it(`declares the page language (${SPEC}/foundations/html-lang/)`, () => {
    expect(document.documentElement.getAttribute("lang")).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
  });

  it(`declares UTF-8 (${SPEC}/foundations/meta-charset/)`, () => {
    expect(document.querySelector("meta[charset]")?.getAttribute("charset")?.toLowerCase()).toBe("utf-8");
  });

  it(`sets a responsive viewport (${SPEC}/foundations/meta-viewport/)`, () => {
    expect(document.querySelector('meta[name="viewport"]')?.getAttribute("content")).toContain(
      "width=device-width",
    );
  });

  it(`has a title (${SPEC}/foundations/title/)`, () => {
    expect(document.title.trim()).not.toBe("");
  });

  it(`has exactly one h1 (${SPEC}/seo/heading-hierarchy/)`, () => {
    expect(document.querySelectorAll("h1")).toHaveLength(1);
  });

  it(`has a target for every skip link (${SPEC}/accessibility/skip-links/)`, () => {
    const targets = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
      .map((link) => link.getAttribute("href")?.slice(1))
      .filter((id): id is string => Boolean(id));
    for (const id of targets) {
      expect(document.getElementById(id), `#${id}`).not.toBeNull();
    }
  });

  it(`loads no resources over plain HTTP (${SPEC}/security/mixed-content/)`, () => {
    const insecure = [...document.querySelectorAll("[src], link[href]")]
      .map((element) => element.getAttribute("src") ?? element.getAttribute("href") ?? "")
      .filter((url) => url.startsWith("http://"));
    expect(insecure).toEqual([]);
  });
});
