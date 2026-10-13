import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventCard } from "@/components/EventCard";
import type { TedxEvent } from "@/content";

const event: TedxEvent = {
  slug: "open-mic",
  title: "Open Mic Night",
  startsAt: "2026-06-25T18:00:00.000Z",
  location: "Zoku",
  url: "https://www.eventbrite.com/e/open-mic",
};

describe("EventCard", () => {
  it("names the event in the link, starting with the visible text (WCAG 2.5.3)", () => {
    render(<EventCard event={event} />);
    expect(screen.getByRole("link", { name: "Learn more about Open Mic Night" })).toHaveAttribute("href", event.url);
  });

  it("shows no link when the event has none", () => {
    render(<EventCard event={{ ...event, url: undefined }} />);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("shows the date in Amsterdam time as a machine readable time", () => {
    render(<EventCard event={event} />);
    expect(screen.getByText("Thursday 25 June 2026")).toHaveAttribute("datetime", event.startsAt);
  });

  it("leaves out the location line when there is no location or tag", () => {
    const { container } = render(<EventCard event={{ ...event, location: undefined }} />);
    expect(screen.getByRole("heading", { level: 3, name: "Open Mic Night" })).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});
