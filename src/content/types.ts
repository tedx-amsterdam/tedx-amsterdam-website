import type { SafeHtml } from "@/lib/sanitize-html";

export type { SafeHtml };

// Domain types describe the content, not the CMS. Every content source maps
// its own data to these, so pages never depend on where content comes from.

export type Image = {
  url: string;
  // Never empty: sources fall back to a meaningful description, such as the
  // speaker name, when the CMS has no alt text.
  alt: string;
  // Versions of the image by width, for srcset: smaller copies from the CMS
  // and, when its width can be bounded, url itself. Missing or empty when
  // the CMS has none; url always works on its own.
  variants?: readonly ImageVariant[];
};

export type ImageVariant = {
  url: string;
  // Width in pixels, for the w descriptor in srcset.
  width: number;
};

export type Speaker = {
  // Public URL segment, /speakers/{slug}. Kept identical to the Webflow slugs.
  slug: string;
  name: string;
  // Only for talks that have a title of their own; 2026 speakers have none.
  sessionTitle?: string;
  // Job or occupation, for example "Founder, Circle Economy".
  role?: string;
  // Role within TEDxAmsterdam, for example "2026 Impact Pioneer Winner".
  tedxRole?: string;
  pronouns?: string;
  sessionBlurb?: SafeHtml;
  bio?: SafeHtml;
  photo?: Image;
  // Lower shows first; speakers without an order come last.
  order?: number;
};

// Named TedxEvent, not Event, so it never shadows the DOM Event type.
export type TedxEvent = {
  // Identifies the event; events have no pages of their own.
  slug: string;
  title: string;
  // Start as an ISO 8601 instant in UTC, as toISOString() writes it, so
  // starts sort as text. Show it in the Europe/Amsterdam time zone.
  startsAt: string;
  location?: string;
  // Plain text, not rich text: the CMS field is plain.
  description?: string;
  // Tickets or the event page, on another site.
  url?: string;
  tag?: string;
  image?: Image;
};
