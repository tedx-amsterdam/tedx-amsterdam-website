import sanitize from "sanitize-html";

declare const safeHtmlBrand: unique symbol;

// HTML that went through sanitizeHtml. Domain types use this for rich text,
// so raw CMS HTML cannot reach a component by accident.
export type SafeHtml = string & { readonly [safeHtmlBrand]: true };

// Pages own their h1, so a CMS h1 becomes an h2. Other disallowed tags are
// dropped but their text is kept.
const OPTIONS: sanitize.IOptions = {
  allowedTags: ["p", "br", "strong", "b", "em", "i", "a", "ul", "ol", "li", "blockquote", "h2", "h3", "h4"],
  allowedAttributes: { a: ["href"] },
  allowedSchemes: ["https", "http", "mailto"],
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: { h1: "h2" },
  // Webflow leaves empty paragraphs behind, including ones that only hold a
  // zero width joiner (<p>&zwj;</p>) or a non breaking space.
  exclusiveFilter: (frame) => frame.tag === "p" && !frame.mediaChildren.length && isBlank(frame.text),
};

const BLANK = /^[\s\u200b-\u200d\u2060\ufeff]*$/;

function isBlank(text: string): boolean {
  return BLANK.test(text);
}

export function sanitizeHtml(html: string): SafeHtml {
  return sanitize(html, OPTIONS).trim() as SafeHtml;
}
