import sanitize from "sanitize-html";
import type { SafeHtml } from "./sanitize-html";

// Plain text from sanitised rich text, for meta descriptions and structured
// data. sanitize-html strips every tag and re-escapes only these four
// characters, so decoding them gives the original text back. &amp; goes
// last, so "&amp;lt;" becomes "&lt;" and not "<".
const ESCAPES: [RegExp, string][] = [
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&quot;/g, '"'],
  [/&amp;/g, "&"],
];

export function toPlainText(html: SafeHtml): string {
  // Keep words in separate paragraphs, list items and lines apart.
  const spaced = html.replace(/<\/(p|li|h2|h3|h4|blockquote)>|<br\s*\/?>/g, "$& ");
  let text = sanitize(spaced, { allowedTags: [], allowedAttributes: {} });
  for (const [pattern, char] of ESCAPES) text = text.replace(pattern, char);
  return text.replace(/\s+/g, " ").trim();
}

// Shortens text to at most maxLength characters at a word boundary, with an
// ellipsis when anything was cut.
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:]+$/, "")}…`;
}
