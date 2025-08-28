#!/bin/bash

echo "🚨 PRODUCTION DEPLOYMENT FIX"
echo "==========================="
echo ""
echo "Password: Bobby321&Gloria321Watkins?"
echo ""

ssh root@72.60.28.175 << 'ENDSSH'
set -e
echo "🔍 Checking Docker images..."
docker images | grep steppers || echo "No stepperslife images found"

echo ""
echo "🏗️ Building fresh image..."
cd /opt/stepperslife
docker build --no-cache -t stepperslife:latest .

echo ""
echo "🧹 Cleaning up old containers..."
docker stop $(docker ps -aq | grep -E "3000|steppers") 2>/dev/null || true
docker rm $(docker ps -aq | grep -E "3000|steppers") 2>/dev/null || true

echo ""
echo "🚀 Starting production container with bridge network..."
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network bridge \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PLATFORM_FEE_PER_TICKET=1.50 \
  -e NEXTAUTH_URL=https://stepperslife.com \
  -e NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc= \
  -e GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com \
  -e GOOGLE_CLIENT_SECRET=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 \
  -e NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud \
  -e CONVEX_DEPLOYMENT=prod:mild-newt-621 \
  -e NEXT_PUBLIC_APP_URL=https://stepperslife.com \
  -e NEXT_PUBLIC_APP_NAME=SteppersLife \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE \
  -e DATABASE_URL="file:./dev.db" \
  stepperslife:latest

echo ""
echo "⏳ Waiting for container to start..."
sleep 10

echo ""
echo "✅ Container status:"
docker ps | grep stepperslife || echo "❌ Container not running!"

echo ""
echo "📋 Container logs:"
docker logs stepperslife-prod --tail 20

echo ""
echo "🌐 Testing endpoints:"
curl -s http://localhost:3000/version || echo "Not ready yet"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next step: Configure Traefik to route to this container"
ENDSSH