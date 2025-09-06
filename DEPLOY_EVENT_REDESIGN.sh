#!/bin/bash

echo "🚀 Deploying Event Page Redesign to Production"
echo "=============================================="
echo ""

# Use sshpass to avoid password prompt
sshpass -p "Bobby321&Gloria321Watkins?" ssh -o StrictHostKeyChecking=no root@72.60.28.175 << 'ENDSSH'
echo "Connected to production server..."

# Stop and remove old container
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# Clone latest code
cd /opt
rm -rf stepperslife
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife

# Configure Next.js
cat > next.config.js << 'EOF'
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  generateBuildId: async () => {
    return `build-event-redesign-${Date.now()}`;
  },
  images: { 
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ] 
  }
}
module.exports = nextConfig
EOF

# Create production env file with CORRECT Convex URL
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Convex - CORRECT URL
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760

# App Configuration
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBMW2IwlZLib2w_wbqfeZVa0r3L1_XXlvM
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiaXJhd2F0a2lucyIsImEiOiJjbWYyeGt1dzIwNXd1MnFvaHRrN2QwdnJ1In0.buWgnlsdSanIFCXU_-HGeA

# Database
DATABASE_URL="file:./dev.db"

# MinIO
MINIO_ENDPOINT=72.60.28.175
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=stepperslife
EOF

# Build Docker image
echo "🏗️ Building Docker image with event redesign..."
docker build --no-cache -t stepperslife:latest .

# Run container with environment file
echo "🚀 Starting production container..."
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --memory="1g" \
  --memory-swap="1.5g" \
  --network dokploy-network \
  -p 3000:3000 \
  --env-file /opt/stepperslife/.env.production \
  --health-cmd="curl -f http://localhost:3000/api/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`) || Host(\`www.stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  stepperslife:latest

# Verify deployment
sleep 10
echo ""
echo "Checking deployment..."
docker ps | grep stepperslife-prod
docker logs stepperslife-prod --tail 20
echo ""
echo "✅ Event page redesign deployed! Site will be live in 1-2 minutes."
echo "Visit: https://stepperslife.com/event/[eventId]"
ENDSSH

echo ""
echo "🎉 Deployment script completed!"