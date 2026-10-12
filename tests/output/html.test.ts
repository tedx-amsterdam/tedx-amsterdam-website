import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/config/site";
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

  it(`never skips a heading level (${SPEC}/seo/heading-hierarchy/)`, () => {
    // CMS rich text brings its own h2 to h4, so this covers content too.
    const levels = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")].map((h) => Number(h.tagName[1]));
    expect(levels[0]).toBe(1);
    for (const [i, level] of levels.entries()) {
      if (i > 0) expect(level, `h${levels[i - 1]} followed by h${level}`).toBeLessThanOrEqual(levels[i - 1]! + 1);
    }
  });

  it(`gives every image alt text (${SPEC}/accessibility/image-alt-text/)`, () => {
    for (const img of document.querySelectorAll("img")) {
      expect(img.hasAttribute("alt"), `alt on ${img.getAttribute("src")?.slice(0, 80)}`).toBe(true);
    }
  });

  // Only images in <main>: the design system logo in the header has no
  // dimensions yet (see "Design system follow ups" in the roadmap).
  it(`gives content images explicit dimensions (${SPEC}/performance/image-optimization/)`, () => {
    for (const img of document.querySelectorAll("main img")) {
      expect(img.getAttribute("width") && img.getAttribute("height"), `on ${img.getAttribute("src")?.slice(0, 80)}`).toBeTruthy();
    }
  });

  it(`does not lazy load the first content image (${SPEC}/performance/lazy-loading/)`, () => {
    // The first image in <main> is the likely largest contentful paint.
    expect(document.querySelector("main img")?.getAttribute("loading") ?? "eager").not.toBe("lazy");
  });

  it("only sets sizes on images with a srcset", () => {
    for (const img of document.querySelectorAll("img[sizes]")) expect(img.hasAttribute("srcset")).toBe(true);
  });

  it(`has valid JSON-LD (${SPEC}/seo/structured-data/)`, () => {
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      expect(JSON.parse(script.textContent ?? "")).toHaveProperty("@context", "https://schema.org");
    }
  });

  it(`loads no resources over plain HTTP (${SPEC}/security/mixed-content/)`, () => {
    const insecure = [...document.querySelectorAll("[src], link[href]")]
      .map((element) => element.getAttribute("src") ?? element.getAttribute("href") ?? "")
      .filter((url) => url.startsWith("http://"));
    expect(insecure).toEqual([]);
  });
});

const speakerPages = pages.filter((page) => /^speakers(\/[a-z0-9-]+)?\.html$/.test(page.path));

const overview = speakerPages.find((page) => page.path === "speakers.html");
const detailPages = speakerPages.filter((page) => page !== overview);
const jsonLd = (document: Document) =>
  [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) => JSON.parse(script.textContent ?? ""));

describe("speaker pages", () => {
  it("build a detail page for every speaker on the overview", () => {
    expect(overview).toBeDefined();
    const linked = new Set(
      [...overview!.document.querySelectorAll<HTMLAnchorElement>('main a[href^="/speakers/"]')].map((a) => a.getAttribute("href")),
    );
    expect(linked.size).toBeGreaterThan(0);
    expect(linked.size).toBe(detailPages.length);
  });

  it("only link to speaker pages that exist", () => {
    for (const { path, document } of speakerPages) {
      for (const a of document.querySelectorAll('a[href^="/speakers/"]')) {
        const href = a.getAttribute("href")!;
        expect(outFileExists(`${href.slice(1)}.html`), `${href} on ${path}`).toBe(true);
      }
    }
  });

  it(`use srcset for photos with variants (${SPEC}/performance/image-optimization/)`, () => {
    expect(speakerPages.some(({ document }) => document.querySelector("main img[srcset][sizes]"))).toBe(true);
  });
});

describe.each(speakerPages)("$path", ({ path, document }) => {
  const meta = (selector: string) => document.querySelector(selector)?.getAttribute("content") ?? "";

  it(`has a description (${SPEC}/foundations/meta-description/)`, () => {
    expect(meta('meta[name="description"]').length).toBeGreaterThan(20);
    expect(meta('meta[name="description"]').length).toBeLessThanOrEqual(160);
  });

  it(`has a canonical URL on the real domain (${SPEC}/foundations/canonical-url/)`, () => {
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(`${SITE_URL}/${path.replace(/\.html$/, "")}`);
  });

  it(`has Open Graph data (${SPEC}/foundations/open-graph/)`, () => {
    for (const property of ["og:title", "og:description", "og:url", "og:type"]) {
      expect(meta(`meta[property="${property}"]`), property).not.toBe("");
    }
  });

  it(`has structured data (${SPEC}/seo/structured-data/)`, () => {
    expect(document.querySelector('script[type="application/ld+json"]')).not.toBeNull();
  });

  it("names the site and uses the canonical URL in Open Graph", () => {
    expect(meta('meta[property="og:site_name"]')).toBe("TEDxAmsterdam");
    expect(meta('meta[property="og:url"]')).toBe(document.querySelector('link[rel="canonical"]')?.getAttribute("href"));
  });
});

describe.each(detailPages)("$path", ({ document }) => {
  const canonical = () => document.querySelector('link[rel="canonical"]')?.getAttribute("href");
  const graph = () => jsonLd(document).flatMap((data) => data["@graph"] ?? [data]);

  it(`describes the speaker as a Person on this URL (${SPEC}/seo/structured-data/)`, () => {
    const person = graph().find((node) => node["@type"] === "Person");
    expect(person).toMatchObject({ url: canonical(), name: document.querySelector("h1")?.textContent });
  });

  it(`has a breadcrumb trail that matches its structured data (${SPEC}/seo/breadcrumbs/)`, () => {
    const list = graph().find((node) => node["@type"] === "BreadcrumbList");
    const items: { name: string; item: string }[] = list?.itemListElement ?? [];
    expect(items.at(-1)?.item).toBe(canonical());
    const trail = document.querySelector('nav[aria-label="Breadcrumb"]');
    const current = trail?.querySelector('[aria-current="page"]');
    expect(current?.textContent).toBe(items.at(-1)?.name);
    expect(current?.closest("a")).toBeNull();
    expect([...trail!.querySelectorAll("a")].map((a) => a.textContent)).toEqual(items.slice(0, -1).map((item) => item.name));
  });
});
