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
    return `build-${Date.now()}-v3.1.1`;
  },
  
  // Environment variables
  env: {
    BUILD_TIME: new Date().toISOString(),
    DEPLOYMENT_VERSION: '3.1.1',
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
  
  // Webpack configuration to handle Square SDK
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent Square SDK minification issues
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer.forEach((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin' || minimizer.constructor.name === 'SWCMinifyPlugin') {
            if (!minimizer.options) minimizer.options = {};
            if (!minimizer.options.terserOptions) minimizer.options.terserOptions = {};
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              keep_classnames: true,
              keep_fnames: true,
              mangle: {
                reserved: ['Client', 'Square', 'BigInt', 'ApiError', 'ApiResponse']
              }
            };
          }
        });
      }
      
      // Add Square as external to prevent bundling issues
      if (!config.externals) config.externals = [];
      if (Array.isArray(config.externals)) {
        config.externals.push('square');
      }
    }
    return config;
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
      {
        source: '/api/health',
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