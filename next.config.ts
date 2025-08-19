import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { hostname: "upbeat-stoat-959.convex.cloud", protocol: "https" },
      { hostname: "wary-anaconda-29.convex.cloud", protocol: "https" },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: "SteppersLife",
  },
};

export default nextConfig;
