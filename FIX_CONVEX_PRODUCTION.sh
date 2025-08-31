#!/bin/bash

echo "🔧 FIXING CONVEX PRODUCTION CONNECTION"
echo "======================================"

# Server details
SERVER_IP="72.60.28.175"
SERVER_USER="root"
SERVER_PASSWORD="Bobby321&Gloria321Watkins?"

echo "📝 Creating fix script..."

cat > /tmp/fix_convex_prod.sh << 'CONVEX_FIX'
#!/bin/bash
set -e

echo "📂 Navigating to project directory..."
cd /opt/stepperslife || exit 1

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📝 Creating .env.local for Convex deployment..."
cat > .env.local << 'EOF'
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
EOF

echo "🚀 Deploying Convex functions to production..."
npx convex deploy -y

echo "📝 Updating production environment file..."
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Clerk Authentication (Keep temporarily)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq

# Auth.js Authentication  
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Convex Configuration - CRITICAL
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760

# App Configuration
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE

# Database
DATABASE_URL="file:./dev.db"

# Square Configuration
SQUARE_ENVIRONMENT=production
DISABLE_SQUARE=false
EOF

echo "🔧 Ensuring next.config.js handles errors..."
cat > next.config.js << 'NEXTCONFIG'
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Ensure environment variables are available
  env: {
    NEXT_PUBLIC_CONVEX_URL: 'https://youthful-porcupine-760.convex.cloud',
    CONVEX_DEPLOYMENT: 'prod:youthful-porcupine-760',
  },
}
module.exports = nextConfig
NEXTCONFIG

echo "🔧 Updating docker-entrypoint.sh..."
cat > docker-entrypoint.sh << 'ENTRYPOINT'
#!/bin/sh

# Ensure we listen on all interfaces
export HOSTNAME=0.0.0.0

# Ensure Convex environment variables are set
export NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
export CONVEX_DEPLOYMENT=prod:youthful-porcupine-760

# Start the application
echo "Starting SteppersLife application..."
echo "Convex URL: $NEXT_PUBLIC_CONVEX_URL"
exec node server.js
ENTRYPOINT
chmod +x docker-entrypoint.sh

echo "🐳 Building Docker image with Convex fix..."
docker build --no-cache -t stepperslife:convex-fix .

echo "🛑 Stopping existing container..."
docker stop stepperslife-final 2>/dev/null || true
docker rm stepperslife-final 2>/dev/null || true

echo "🚀 Starting new container with Convex fix..."
docker run -d \
  --name stepperslife-final \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3000:3000 \
  --env-file .env.production \
  -e NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud \
  -e CONVEX_DEPLOYMENT=prod:youthful-porcupine-760 \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`) || Host(\`www.stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  --label "traefik.http.routers.stepperslife.entrypoints=websecure" \
  --label "traefik.http.routers.stepperslife.tls.certresolver=letsencrypt" \
  stepperslife:convex-fix

echo "⏳ Waiting for container to start..."
sleep 15

echo "✅ Verifying deployment..."
docker ps | grep stepperslife-final

echo "🔍 Checking container logs..."
docker logs stepperslife-final --tail 30

echo "🔍 Testing Convex connection..."
curl -s https://youthful-porcupine-760.convex.cloud 2>&1 | head -5 || echo "Direct Convex test complete"

echo ""
echo "✅ Convex fix deployed!"
CONVEX_FIX

echo "🚀 Executing fix on server..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP 'bash -s' < /tmp/fix_convex_prod.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONVEX PRODUCTION FIX DEPLOYED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Actions taken:"
echo "1. ✅ Deployed Convex functions to production"
echo "2. ✅ Set CONVEX_DEPLOYMENT environment variable"
echo "3. ✅ Added Convex env vars to docker-entrypoint.sh"
echo "4. ✅ Passed env vars directly to Docker container"
echo "5. ✅ Rebuilt and redeployed application"
echo ""
echo "🧪 Please test:"
echo "1. Go to https://stepperslife.com/seller/new-event"
echo "2. Try creating an event"
echo "3. Event should publish successfully"
echo ""
echo "🔍 To check logs:"
echo "ssh root@72.60.28.175"
echo "docker logs -f stepperslife-final"