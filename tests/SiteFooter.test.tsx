import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/SiteFooter";
import { TEDX_DISCLAIMER } from "@/config/tedx";

describe("SiteFooter", () => {
  it("shows the TEDx license disclaimer required on every page", () => {
    render(<SiteFooter />);
    expect(screen.getByText(TEDX_DISCLAIMER)).toBeInTheDocument();
  });

  it("links footer menu items to real pages instead of legacy Webflow URLs", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("link", { name: "Impact Program" })).toHaveAttribute("href", "/impact");
    expect(screen.getByRole("link", { name: "Partners" })).toHaveAttribute("href", "/partners");
  });
});
