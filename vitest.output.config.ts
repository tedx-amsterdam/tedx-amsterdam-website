import { defineConfig } from "vitest/config";

// Checks the static build in out/ against The Website Specification.
// Run after `npm run build`; see tests/output/.
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    include: ["tests/output/**/*.test.ts"],
  },
});
