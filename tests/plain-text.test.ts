import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { toPlainText, truncate } from "@/lib/plain-text";

describe("toPlainText", () => {
  it("strips tags and keeps words in separate blocks apart", () => {
    expect(toPlainText(sanitizeHtml("<p><em>Former</em> nun.</p><p>Now a comedian.</p><ul><li>One</li><li>Two</li></ul>"))).toBe(
      "Former nun. Now a comedian. One Two",
    );
  });

  it("decodes characters that sanitising escaped", () => {
    expect(toPlainText(sanitizeHtml("<p>Fish &amp; chips &lt;3 &quot;yes&quot; King’s</p>"))).toBe('Fish & chips <3 "yes" King’s');
  });

  it("does not decode twice", () => {
    expect(toPlainText(sanitizeHtml("<p>&amp;lt;b&amp;gt;</p>"))).toBe("&lt;b&gt;");
  });

  it("returns an empty string for empty rich text", () => {
    expect(toPlainText(sanitizeHtml("<p>‍</p>"))).toBe("");
  });
});

describe("truncate", () => {
  it("leaves short text alone", () => {
    expect(truncate("Short text.", 20)).toBe("Short text.");
  });

  it("cuts at a word boundary and adds an ellipsis within the limit", () => {
    const result = truncate("Joe Wilson is an entrepreneur, former Microsoft executive", 33);
    expect(result).toBe("Joe Wilson is an entrepreneur…");
    expect(result.length).toBeLessThanOrEqual(33);
  });

  it("cuts a single long word", () => {
    expect(truncate("Supercalifragilistic", 10)).toBe("Supercali…");
  });
});
