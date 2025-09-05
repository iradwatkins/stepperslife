const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  images: { 
    remotePatterns: [{ protocol: "https", hostname: "**" }] 
  },
  async redirects() {
    return [
      // Seller to Organizer redirects (permanent)
      {
        source: '/seller',
        destination: '/organizer',
        permanent: true,
      },
      {
        source: '/seller/:path*',
        destination: '/organizer/:path*',
        permanent: true,
      },
      // Legacy dashboard redirect
      {
        source: '/dashboard',
        destination: '/organizer',
        permanent: true,
      },
      {
        source: '/dashboard/:path*',
        destination: '/organizer/:path*',
        permanent: true,
      },
    ];
  },
}
module.exports = nextConfig
