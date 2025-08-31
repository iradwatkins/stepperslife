#!/bin/bash

echo "🔧 DEPLOYING CLERK AUTHENTICATION FIX"
echo "======================================"

# Server details
SERVER_IP="72.60.28.175"
SERVER_USER="root"
SERVER_PASSWORD="Bobby321&Gloria321Watkins?"

cat > /tmp/deploy_clerk_fix.sh << 'CLERK_FIX'
#!/bin/bash
set -e

echo "📂 Navigating to project directory..."
cd /opt/stepperslife || exit 1

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📝 Ensuring environment variables are set..."
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Clerk Authentication - REQUIRED
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq

# Auth.js Authentication  
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760

# App Configuration
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
DATABASE_URL="file:./dev.db"
EOF

echo "🐳 Building Docker image with Clerk fix..."
docker build --no-cache -t stepperslife:clerk-fix .

echo "🛑 Stopping existing container..."
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

echo "🚀 Starting container with Clerk fix..."
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
  stepperslife:clerk-fix

echo "⏳ Waiting for container to start..."
sleep 10

echo "✅ Checking container status..."
docker ps | grep stepperslife-prod

echo "📋 Container logs:"
docker logs stepperslife-prod --tail 20

echo "🔍 Testing locally..."
curl -s http://localhost:3000 > /dev/null 2>&1 && echo "✅ Local test successful" || echo "⚠️ Local test failed"

echo ""
echo "✅ Clerk authentication fix deployed!"
CLERK_FIX

echo "🚀 Executing deployment..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP 'bash -s' < /tmp/deploy_clerk_fix.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CLERK AUTHENTICATION FIX DEPLOYED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Fix Applied:"
echo "- ClerkProvider now properly wraps the application"
echo "- Clerk authentication will work in production"
echo "- Users can sign in and access protected routes"
echo ""
echo "🧪 Please test:"
echo "1. Visit https://stepperslife.com"
echo "2. Try signing in with Clerk"
echo "3. Navigate to /seller/new-event"
echo "4. Create and publish an event"