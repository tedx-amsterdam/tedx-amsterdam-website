import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EventsPage from "@/app/events/page";
import type { TedxEvent } from "@/content";

const past: TedxEvent = { slug: "past", title: "Past Event", startsAt: "2020-06-26T18:00:00.000Z" };

// For months after the main event there is nothing upcoming, so the page
// must still read well with past events only.
vi.mock("@/content", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/content")>()),
  getEvents: async () => [past],
}));

describe("EventsPage without upcoming events", () => {
  it("keeps the upcoming heading with a message, and lists past events", async () => {
    render(await EventsPage());
    const upcoming = screen.getByRole("region", { name: "Upcoming events" });
    expect(within(upcoming).getByText(/New events are announced here/)).toBeInTheDocument();
    expect(within(upcoming).queryByRole("list")).toBeNull();
    const pastSection = screen.getByRole("region", { name: "Past events" });
    expect(within(pastSection).getByRole("heading", { level: 3, name: "Past Event" })).toBeInTheDocument();
  });
});
