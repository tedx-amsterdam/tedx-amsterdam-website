import type { Partner } from "../types";

// Fictional partners for tests, CI and offline development. They cover a
// current and a past partner, one without a logo, one without a website,
// two with the same order, one without an order and a long name.

const LOGO =
  "data:image/svg+xml," +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 98"><rect width="132" height="98" fill="#ffffff"/></svg>');

export const FIXTURE_PARTNERS: readonly Partner[] = [
  {
    slug: "canal-coffee",
    name: "Canal Coffee",
    status: "current",
    description: "Roasts beans for the breaks between talks.",
    url: "https://example.org/canal-coffee",
    logo: { url: LOGO, alt: "Canal Coffee logo" },
    order: 1,
  },
  {
    slug: "bridge-builders",
    name: "Bridge Builders",
    status: "current",
    description: "Builds the stage, and takes it down again.",
    url: "https://example.org/bridge-builders",
    logo: { url: LOGO, alt: "Bridge Builders logo" },
    order: 1,
  },
  {
    slug: "the-amsterdam-foundation-for-very-long-partner-names",
    name: "The Amsterdam Foundation for Very Long Partner Names and Even Longer Descriptions",
    status: "current",
    order: 2,
  },
  {
    slug: "tulip-print",
    name: "Tulip Print",
    status: "past",
    description: "Printed the programme of an earlier edition.",
    logo: { url: LOGO, alt: "Tulip Print logo" },
  },
];
