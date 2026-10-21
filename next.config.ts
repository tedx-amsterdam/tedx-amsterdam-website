import type { NextConfig } from "next";

// Static export: the site is plain HTML on a CDN. Content changes trigger a
// rebuild instead of ISR, so there is no server runtime to host or maintain.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  // next dev would otherwise write its own block into AGENTS.md whenever an
  // agent runs it. Its one rule is already in AGENTS.md (Stack), so the file
  // stays written by people only.
  agentRules: false,
  images: {
    // next/image optimisation needs a server. CMS images are resized at
    // build time by src/app/images/ instead (decision 29).
    unoptimized: true,
  },
};

export default nextConfig;
