import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/SiteHeader";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("SiteHeader", () => {
  it("links to the ticket shop", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Get tickets" })).toHaveAttribute(
      "href",
      expect.stringContaining("eventbrite.com"),
    );
  });

  it("marks the section of a nested page as current", () => {
    pathname.current = "/speakers/joe-wilson";
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: "Speakers", current: "page" })).toBeInTheDocument();
  });
});
