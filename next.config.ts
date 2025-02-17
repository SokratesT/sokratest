import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "9000" },
      { protocol: "http", hostname: "localhost", port: "9000" },
    ],
  },
  skipTrailingSlashRedirect: true, // Required for PostHog
};

export default nextConfig;
