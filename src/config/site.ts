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

export const FOOTER_NAV: readonly NavItem[] = [
  { label: "Impact Program", href: "/impact" },
  { label: "About us", href: "/about-us" },
  { label: "Speakers", href: "/speakers" },
  { label: "Partners", href: "/partners" },
];

// The design system's SocialLink supports these networks. Facebook is
// linked on the Webflow site but has no icon in the design system yet.
export const SOCIAL_LINKS = [
  { network: "instagram", label: "Instagram", href: "https://www.instagram.com/tedxamsterdam/" },
  { network: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/tedxamsterdam/" },
] as const;

export const LEGAL_ENTITY = "Stichting TEDxAmsterdam";

export const DESIGN_CREDIT: NavItem = { label: "Design busy.studio", href: "https://www.busy.studio/" };

// Evaluated at build time. The site is rebuilt on every content change, so
// the copyright year stays current.
export const BUILD_YEAR = new Date().getFullYear();
