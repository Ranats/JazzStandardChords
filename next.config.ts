import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA support will be added at build time via next-pwa when deploying.
  // For now, keep the dev config clean for Turbopack compatibility.
  turbopack: {},
};

export default nextConfig;
