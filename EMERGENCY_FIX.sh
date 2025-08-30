#!/bin/bash

echo "🚨 EMERGENCY FIX - Direct Deployment"
echo "===================================="

SERVER_IP="72.60.28.175"
SERVER_PASSWORD='Bobby321&Gloria321Watkins?'

sshpass -p "${SERVER_PASSWORD}" ssh root@${SERVER_IP} << 'EMERGENCY_DEPLOY'
echo "📦 Starting emergency deployment..."
cd /opt/stepperslife

# Pull latest code
git pull

# Stop all stepperslife containers
docker stop $(docker ps -q --filter name=stepperslife) 2>/dev/null || true
docker rm $(docker ps -aq --filter name=stepperslife) 2>/dev/null || true

# Create simple production env
cat > .env.production << 'EOF'
NODE_ENV=production
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=PQCIPMEiOpTxnKaFOe8uErSLbUtXOMP7uTG0MwSKPDY=
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621
PLATFORM_FEE_PER_TICKET=1.50
EOF

# Build fresh image
echo "🔨 Building Docker image..."
docker build --no-cache -t stepperslife:emergency .

# Run with host network mode to bypass network issues
echo "🚀 Starting container with host networking..."
docker run -d \
  --name stepperslife-emergency \
  --restart unless-stopped \
  --network host \
  --env-file .env.production \
  stepperslife:emergency

sleep 5
echo "✅ Container started"

# Check status
docker ps | grep stepperslife
curl -I http://localhost:3000/api/test-health

echo "✅ Emergency deployment complete"
EMERGENCY_DEPLOY

echo ""
echo "📋 Testing from local machine..."
sleep 5
curl -I https://stepperslife.com