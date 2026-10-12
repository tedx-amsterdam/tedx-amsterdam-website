import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "@/lib/sanitize-html";

describe("sanitizeHtml", () => {
  it("keeps allowed formatting", () => {
    const html = "<p>Builds <strong>circular</strong> cities, <em>slowly</em>.</p><ul><li>One</li></ul>";
    expect(sanitizeHtml(html)).toBe(html);
  });

  it("removes scripts, styles and event handlers", () => {
    expect(sanitizeHtml('<p onclick="alert(1)">Hi<script>alert(1)</script><style>p{}</style></p>')).toBe("<p>Hi</p>");
  });

  it("keeps the text of disallowed tags", () => {
    expect(sanitizeHtml('<p><span class="x">Hello</span></p><div>World</div>')).toBe("<p>Hello</p>World");
  });

  it("turns a CMS h1 into an h2, because the page owns its h1", () => {
    expect(sanitizeHtml("<h1>Title</h1><h2>Section</h2>")).toBe("<h2>Title</h2><h2>Section</h2>");
  });

  it("keeps safe links and strips other attributes", () => {
    expect(sanitizeHtml('<a href="https://ted.com" target="_blank" style="color:red">TED</a>')).toBe(
      '<a href="https://ted.com">TED</a>',
    );
  });

  it.each(["javascript:alert(1)", "data:text/html,x", "//evil.example"])("drops the unsafe href %s", (href) => {
    expect(sanitizeHtml(`<a href="${href}">x</a>`)).toBe("<a>x</a>");
  });

  it("drops images and iframes", () => {
    expect(sanitizeHtml('<p>A<img src="x.png" alt=""><iframe src="https://x"></iframe></p>')).toBe("<p>A</p>");
  });

  it.each(["<p></p>", "<p> </p>", "<p>‍</p>", "<p>&zwj;</p>", "<p>&nbsp;</p>", "<p><br></p>"])(
    "drops the empty paragraph %j",
    (empty) => {
      expect(sanitizeHtml(`<p>Text</p>${empty}`)).toBe("<p>Text</p>");
    },
  );

  it("returns an empty string for empty input", () => {
    expect(sanitizeHtml("  ")).toBe("");
  });
});
