import { describe, expect, it } from "vitest";
import { headersFor, loadHeaders, parseHeaders } from "./support/headers";

// Each check links to its requirement in The Website Specification.
const SPEC = "https://specification.website/spec";

const rules = loadHeaders();

describe("parseHeaders", () => {
  it("reads patterns, headers and skips comments", () => {
    const parsed = parseHeaders("# comment\n/*\n  X-Test: a: b\n\n/x\n  Y: z\n");
    expect(parsed).toHaveLength(2);
    expect(parsed[0]?.headers.get("x-test")).toBe("a: b");
  });
});

describe("security headers on every response", () => {
  const all = headersFor(rules, "/*");

  it(`enforce HTTPS for at least a year (${SPEC}/security/hsts/)`, () => {
    const maxAge = Number(all.get("strict-transport-security")?.match(/max-age=(\d+)/)?.[1]);
    expect(maxAge).toBeGreaterThanOrEqual(31536000);
  });

  it(`disable MIME sniffing (${SPEC}/security/x-content-type-options/)`, () => {
    expect(all.get("x-content-type-options")).toBe("nosniff");
  });

  it(`prevent framing (${SPEC}/security/frame-ancestors/)`, () => {
    expect(all.get("content-security-policy")).toContain("frame-ancestors 'none'");
    expect(all.get("x-frame-options")).toBe("DENY");
  });

  it(`restrict base and object sources (${SPEC}/security/content-security-policy/)`, () => {
    const csp = all.get("content-security-policy") ?? "";
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("object-src 'none'");
  });

  it(`limit referrer data (${SPEC}/security/referrer-policy/)`, () => {
    expect(all.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
  });

  it(`switch off unused browser features (${SPEC}/security/permissions-policy/)`, () => {
    const policy = all.get("permissions-policy") ?? "";
    for (const feature of ["camera", "microphone", "geolocation"]) {
      expect(policy).toContain(`${feature}=()`);
    }
  });

  it(`isolate the browsing context (${SPEC}/security/cross-origin-isolation/)`, () => {
    expect(all.get("cross-origin-opener-policy")).toBe("same-origin");
  });

  it(`never send X-XSS-Protection (${SPEC}/security/x-xss-protection/)`, () => {
    for (const rule of rules) {
      expect(rule.headers.has("x-xss-protection"), rule.pattern).toBe(false);
    }
  });
});

describe("caching", () => {
  it.each(["/_next/static/*", "/images/*"])(`caches hashed files in %s for a year (${SPEC}/performance/cache-control/)`, (pattern) => {
    const cacheControl = headersFor(rules, pattern).get("cache-control") ?? "";
    expect(cacheControl).toContain("immutable");
    expect(Number(cacheControl.match(/max-age=(\d+)/)?.[1])).toBeGreaterThanOrEqual(31536000);
  });
});

describe("pages.dev deployments", () => {
  it(`are kept out of search engines (${SPEC}/seo/meta-robots/)`, () => {
    expect(headersFor(rules, "https://:project.pages.dev/*").get("x-robots-tag")).toBe("noindex");
    expect(headersFor(rules, "https://:version.:project.pages.dev/*").get("x-robots-tag")).toBe("noindex");
  });
});
