#!/bin/bash
set -e

# Navigate to app directory
cd /opt || exit 1
rm -rf stepperslife
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife

# Create production environment file
cat > .env.production << 'ENVEOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq

# Convex
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760

# App Configuration
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE

# Database
DATABASE_URL="file:./dev.db"

# Server Access
SERVER_IP=72.60.28.175
SERVER_USER=root
SERVER_PASSWORD=Bobby321&Gloria321Watkins?
ENVEOF

# Create optimized Next.js config for production
cat > next.config.js << 'NEXTEOF'
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  }
}
module.exports = nextConfig
NEXTEOF

# Build Docker image with no cache
docker build --no-cache -t stepperslife:latest .

# Stop and remove existing container
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# Run new container
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3000:3000 \
  --env-file .env.production \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`) || Host(\`www.stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  stepperslife:latest

# Verify container is running
docker ps | grep stepperslife-prod
