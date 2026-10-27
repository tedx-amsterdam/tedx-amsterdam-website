import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { linkEvent, placement, trackEvent } from "@/lib/analytics";
import { AnalyticsEvents } from "@/components/AnalyticsEvents";
import { PageNotFoundEvent } from "@/components/PageNotFoundEvent";

function link(href: string, container: string = "main"): HTMLAnchorElement {
  const parent = document.createElement(container);
  const anchor = document.createElement("a");
  anchor.href = href;
  parent.append(anchor);
  return anchor;
}

beforeEach(() => {
  window.dataLayer = [];
});

afterEach(() => {
  delete window.dataLayer;
});

describe("trackEvent", () => {
  it("pushes the event and its parameters to the data layer", () => {
    trackEvent("ticket_click", { placement: "header" });
    expect(window.dataLayer).toEqual([{ event: "ticket_click", placement: "header" }]);
  });

  it("creates the data layer when Tag Manager has not loaded", () => {
    delete window.dataLayer;
    trackEvent("page_not_found", {});
    expect(window.dataLayer).toEqual([{ event: "page_not_found" }]);
  });
});

describe("linkEvent", () => {
  it("names the events the live site measures", () => {
    expect(linkEvent(link("https://www.eventbrite.com/e/tedxamsterdam-2026"))).toBe("ticket_click");
    expect(linkEvent(link("https://www.eventbrite.nl/e/impact-program-event"))).toBe("ticket_click");
    expect(linkEvent(link("https://docs.google.com/forms/d/e/abc/viewform"))).toBe("application_click");
    expect(linkEvent(link("mailto:partners@tedxamsterdam.nl"))).toBe("partner_contact");
  });

  it("ignores other links", () => {
    expect(linkEvent(link("/speakers"))).toBeUndefined();
    expect(linkEvent(link("https://www.instagram.com/tedxamsterdam/"))).toBeUndefined();
  });
});

describe("placement", () => {
  it("reads the landmark the link sits in", () => {
    expect(placement(link("/", "header"))).toBe("header");
    expect(placement(link("/", "footer"))).toBe("footer");
    expect(placement(link("/", "main"))).toBe("content");
  });
});

describe("AnalyticsEvents", () => {
  it("tracks a ticket click with where it happened", () => {
    render(
      <>
        <AnalyticsEvents />
        <header>
          <a href="https://www.eventbrite.com/e/tedxamsterdam-2026">Get tickets</a>
        </header>
      </>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Get tickets" }));
    expect(window.dataLayer).toEqual([
      {
        event: "ticket_click",
        link_url: "https://www.eventbrite.com/e/tedxamsterdam-2026",
        link_text: "Get tickets",
        placement: "header",
        page_location_path: "/",
      },
    ]);
  });

  it("leaves other clicks alone", () => {
    render(
      <>
        <AnalyticsEvents />
        <a href="https://www.instagram.com/tedxamsterdam/">Instagram</a>
      </>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Instagram" }));
    expect(window.dataLayer).toEqual([]);
  });
});

describe("PageNotFoundEvent", () => {
  it("tracks the missing page and the page that linked to it", () => {
    render(<PageNotFoundEvent />);
    expect(window.dataLayer).toEqual([
      { event: "page_not_found", page_location_path: "/", referrer_url: "" },
    ]);
  });
});
