import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library only auto-cleans when test globals are enabled. We keep
// globals off for explicit imports, so unmount after each test ourselves.
afterEach(() => {
  cleanup();
});
