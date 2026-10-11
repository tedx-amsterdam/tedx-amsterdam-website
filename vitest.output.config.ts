import { defineConfig } from "vitest/config";

// Checks the static build in out/ against The Website Specification.
// Run after `npm run build`; see tests/output/.
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["tests/output/**/*.test.ts"],
  },
});
