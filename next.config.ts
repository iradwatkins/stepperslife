import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { hostname: "upbeat-stoat-959.convex.cloud", protocol: "https" },
      { hostname: "wary-anaconda-29.convex.cloud", protocol: "https" },
      { hostname: "mild-newt-621.convex.cloud", protocol: "https" },
      { hostname: "little-jellyfish-146.convex.cloud", protocol: "https" },
      // Allow all Convex storage URLs
      { hostname: "*.convex.cloud", protocol: "https" },
    ],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: "SteppersLife",
    NEXT_PUBLIC_BUILD_VERSION: "2.0.1-CRITICAL",
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
    NEXT_PUBLIC_DEPLOYMENT_ID: `deploy-${Date.now()}`,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Force cache invalidation
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  // Add headers for cache control
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
