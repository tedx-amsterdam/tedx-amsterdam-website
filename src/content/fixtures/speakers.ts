import { sanitizeHtml } from "@/lib/sanitize-html";
import type { Speaker } from "../types";

// Fictional speakers for tests, CI and offline development. They cover the
// cases pages must handle: no photo, no order, a long name, a session title,
// no rich text, rich text with headings, and the empty paragraphs Webflow
// leaves behind.

// An inline grey portrait, so fixtures work offline and never hit a CDN.
const PORTRAIT =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><rect width="400" height="500" fill="#d9d9d9"/><circle cx="200" cy="190" r="90" fill="#b3b3b3"/><ellipse cx="200" cy="470" rx="160" ry="150" fill="#b3b3b3"/></svg>',
  );

export const FIXTURE_SPEAKERS: readonly Speaker[] = [
  {
    slug: "amara-okafor",
    name: "Amara Okafor",
    role: "Urban ecologist, University of Amsterdam",
    pronouns: "she/her",
    sessionBlurb: sanitizeHtml(
      "<p>What if the city itself could breathe? Amara shows how <strong>green corridors</strong> turn streets into ecosystems, and why growth does not have to mean more concrete.</p><p>‍</p>",
    ),
    bio: sanitizeHtml("<p><em>Amara studies how cities and nature share space.</em></p>"),
    // Variants exercise srcset in the build; real ones come from the CMS.
    photo: {
      url: PORTRAIT,
      alt: "Portrait of Amara Okafor",
      variants: [
        { url: PORTRAIT, width: 400 },
        { url: PORTRAIT, width: 800 },
      ],
    },
    order: 1,
  },
  {
    slug: "joost-van-der-meulen",
    name: "Joost van der Meulen",
    role: "Founder, Repair Collective",
    tedxRole: "2026 TEDxAmsterdam Impact Pioneer Winner",
    pronouns: "he/him",
    sessionBlurb: sanitizeHtml(
      '<p>Joost started fixing bikes on a street corner. Today his <a href="https://example.org/repair">repair network</a> keeps 40,000 products a year out of the waste stream.</p>',
    ),
    bio: sanitizeHtml("<p><em>Joost believes the most sustainable product is the one you already own.</em></p>"),
    photo: { url: PORTRAIT, alt: "Portrait of Joost van der Meulen" },
    order: 2,
  },
  {
    slug: "maria-fernanda-castellanos-de-la-vega",
    name: "María Fernanda Castellanos de la Vega Rodríguez-Hoogendoorn",
    role: "Economist and author of a book with a very long subtitle about degrowth, care and the future of work",
    pronouns: "she/they",
    sessionBlurb: sanitizeHtml("<p>A long name, a long role and no photo: the layout has to cope.</p>"),
    order: 3,
  },
  {
    slug: "the-quiet-economy",
    name: "Pieter de Wit",
    sessionTitle: "The quiet economy",
    role: "Philosopher",
    // Headings as an editor might pick them: they must not skip a level on the page.
    sessionBlurb: sanitizeHtml(
      "<p>A talk with a title of its own, as 2025 speakers had.</p><p>&nbsp;</p><h4>Why it matters</h4><p>Because quiet work adds up.</p>",
    ),
    bio: sanitizeHtml("<h3>Background</h3><p><em>Pieter writes about what economies leave unsaid.</em></p>"),
    photo: { url: PORTRAIT, alt: "Portrait of Pieter de Wit" },
    order: 4,
  },
  {
    slug: "lin-chen",
    name: "Lin Chen",
    // No order, so Lin is listed last. No bio or blurb either, so the page
    // falls back to a description built from the name.
    role: "Designer",
    photo: { url: PORTRAIT, alt: "Portrait of Lin Chen" },
  },
];
