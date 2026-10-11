import type { NextConfig } from "next";

// Static export: the site is plain HTML on a CDN. Content changes trigger a
// rebuild instead of ISR, so there is no server runtime to host or maintain.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  images: {
    // next/image optimisation needs a server. CMS images are served as is
    // from their CDN until we pick an image pipeline.
    unoptimized: true,
  },
};

export default nextConfig;
