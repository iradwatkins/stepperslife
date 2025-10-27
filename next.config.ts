import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "events.stepperslife.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3004",
      },
    ],
  },
};

export default nextConfig;
