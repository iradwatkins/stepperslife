#!/bin/bash

echo "🚀 Starting deployment on server..."
cd /opt

# Backup current deployment
if [ -d "stepperslife" ]; then
  echo "📦 Backing up current deployment..."
  mv stepperslife stepperslife.backup.$(date +%s)
fi

# Clone repository
echo "📥 Cloning repository..."
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife

# Create optimized next.config.js
echo "⚙️ Creating Next.js configuration..."
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Ensure proper headers for auth
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
EOF

# Create production environment file with auth fixes
echo "🔧 Setting up environment variables..."
cat > .env.production << 'ENV_FILE'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Auth Configuration - CRITICAL FOR SESSION PERSISTENCE
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=NEXTAUTH_SECRET_PLACEHOLDER
NEXT_PUBLIC_APP_URL=https://stepperslife.com

# Google OAuth
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE

# App Configuration
NEXT_PUBLIC_APP_NAME=SteppersLife
DATABASE_URL="file:./dev.db"

# Optional Square Configuration
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_APPLICATION_ID=
SQUARE_WEBHOOK_SIGNATURE_KEY=
ENV_FILE

# Replace placeholder with actual secret
sed -i "s/NEXTAUTH_SECRET_PLACEHOLDER/PQCIPMEiOpTxnKaFOe8uErSLbUtXOMP7uTG0MwSKPDY=/" .env.production

# Build Docker image
echo "🐳 Building Docker image..."
docker build --no-cache -t stepperslife:latest .

# Stop and remove old container
echo "🛑 Stopping old container..."
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# Run new container with proper configuration
echo "🚀 Starting new container..."
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3000:3000 \
  --env-file .env.production \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`) || Host(\`www.stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  --label "traefik.http.routers.stepperslife.entrypoints=websecure" \
  --label "traefik.http.routers.stepperslife.tls.certresolver=letsencrypt" \
  stepperslife:latest

# Verify deployment
echo "✅ Verifying deployment..."
sleep 5
docker ps | grep stepperslife-prod

# Test endpoints
echo "🧪 Testing endpoints..."
curl -s http://localhost:3000/api/auth/providers | head -c 100
echo ""
curl -s http://localhost:3000/api/auth/session | head -c 100
echo ""

echo "✅ Deployment complete!"
