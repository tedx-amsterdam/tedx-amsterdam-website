import type { SafeHtml } from "@/lib/sanitize-html";

export type { SafeHtml };

// Domain types describe the content, not the CMS. Every content source maps
// its own data to these, so pages never depend on where content comes from.

export type Image = {
  url: string;
  // Never empty: sources fall back to a meaningful description, such as the
  // speaker name, when the CMS has no alt text.
  alt: string;
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
