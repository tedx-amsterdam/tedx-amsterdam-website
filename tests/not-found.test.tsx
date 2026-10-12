import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "@/app/not-found";

describe("NotFound", () => {
  it("provides the main landmark the skip link points to", () => {
    render(<NotFound />);
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
  });

  it("links back to the homepage", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: /homepage/i })).toHaveAttribute("href", "/");
  });
});
