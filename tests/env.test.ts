import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("accepts fixtures without a token", () => {
    expect(parseEnv({ CONTENT_SOURCE: "fixtures" })).toEqual({ CONTENT_SOURCE: "fixtures" });
  });

  it("accepts webflow with a token and trims it", () => {
    expect(parseEnv({ CONTENT_SOURCE: "webflow", WEBFLOW_API_TOKEN: " abc123 \n" })).toEqual({
      CONTENT_SOURCE: "webflow",
      WEBFLOW_API_TOKEN: "abc123",
    });
  });

  it("ignores unrelated variables", () => {
    expect(parseEnv({ CONTENT_SOURCE: "fixtures", PATH: "/usr/bin" })).toEqual({ CONTENT_SOURCE: "fixtures" });
  });

  it("rejects a missing content source instead of defaulting to fixtures", () => {
    expect(() => parseEnv({})).toThrow(/CONTENT_SOURCE/);
  });

  it("rejects an unknown content source", () => {
    expect(() => parseEnv({ CONTENT_SOURCE: "sanity" })).toThrow(/CONTENT_SOURCE/);
  });

  it.each([undefined, "", "   "])("rejects webflow with token %j", (token) => {
    expect(() => parseEnv({ CONTENT_SOURCE: "webflow", WEBFLOW_API_TOKEN: token })).toThrow(/WEBFLOW_API_TOKEN/);
  });

  it("never includes the token in the error message", () => {
    expect(() => parseEnv({ CONTENT_SOURCE: "webfow", WEBFLOW_API_TOKEN: "secret-token" })).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining("secret-token") }),
    );
  });
});
