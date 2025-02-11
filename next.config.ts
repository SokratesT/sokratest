import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "http", hostname: "localhost", port: "9000" }],
  },
  skipTrailingSlashRedirect: true, // Required for PostHog
};

export default nextConfig;
