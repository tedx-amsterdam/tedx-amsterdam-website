import { sanitizeHtml, type SafeHtml } from "@/lib/sanitize-html";

// Clean up Webflow field values the same way in every mapper.

// Trimmed plain text, or undefined for null, missing or blank fields.
export function text(value: string | null | undefined): string | undefined {
  return value?.trim() || undefined;
}

// Sanitised rich text. sanitizeHtml drops empty paragraphs, including
// <p>&zwj;</p>, so rich text that held only those becomes undefined
// instead of an empty string.
export function richText(value: string | null | undefined): SafeHtml | undefined {
  return value ? sanitizeHtml(value) || undefined : undefined;
}
