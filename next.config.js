const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  images: { 
    remotePatterns: [{ protocol: "https", hostname: "**" }] 
  }
}
module.exports = nextConfig
