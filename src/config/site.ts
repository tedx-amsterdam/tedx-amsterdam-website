export type NavItem = {
  label: string;
  href: string;
};

export const SITE_URL = "https://www.tedxamsterdam.nl";

export const MAIN_NAV: readonly NavItem[] = [
  { label: "After Growth", href: "/after-growth" },
  { label: "Impact Program", href: "/impact" },
  { label: "Events", href: "/events" },
  { label: "Speakers", href: "/speakers" },
  { label: "Partners", href: "/partners" },
  { label: "Blog", href: "/blog" },
  { label: "About Us", href: "/about-us" },
];

// Changes once a year with the main event. Move to the CMS once the
// content layer exposes the featured event.
export const TICKETS: NavItem = {
  label: "Get tickets",
  href: "https://www.eventbrite.com/e/tedxamsterdam-2026-after-growth-tickets-1999762520531",
};
