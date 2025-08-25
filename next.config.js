/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignore ESLint errors during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore TypeScript errors during production builds
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  // Force deployment - Build ID with timestamp
  generateBuildId: async () => {
    return `build-${Date.now()}-v3.1.0`;
  },
  
  // Environment variables
  env: {
    BUILD_TIME: new Date().toISOString(),
    DEPLOYMENT_VERSION: '3.1.0',
    PLATFORM_FEE: '1.50',
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mild-newt-621.convex.cloud',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  
  
  // Headers for cache control
  async headers() {
    return [
      {
        source: '/version',
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

module.exports = nextConfig;