// Events for Google Tag Manager, named as on the live Webflow site so the
// reports in Google Analytics continue after launch (docs/analytics.md).
// Pushing to the data layer is harmless without Tag Manager: the array
// just collects entries until a container reads them.

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type LinkEventName = "ticket_click" | "application_click" | "partner_contact";
export type Placement = "header" | "footer" | "content";

export function trackEvent(event: string, params: Record<string, string>): void {
  window.dataLayer ??= [];
  window.dataLayer.push({ event, ...params });
}

export function linkEvent(link: HTMLAnchorElement): LinkEventName | undefined {
  const href = link.href;
  if (href.includes("eventbrite.")) return "ticket_click";
  if (href.includes("docs.google.com/forms")) return "application_click";
  if (href.startsWith("mailto:partners@")) return "partner_contact";
  return undefined;
}

// Read from landmarks rather than class names, which belong to the design
// system and may change.
export function placement(element: Element): Placement {
  if (element.closest("header")) return "header";
  if (element.closest("footer")) return "footer";
  return "content";
}
