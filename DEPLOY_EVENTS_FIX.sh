#!/bin/bash

echo "🚀 EMERGENCY DEPLOYMENT - Fixing Events Page"
echo "============================================"

# SSH and deploy
sshpass -p 'Bobby321&Gloria321Watkins?' ssh -o StrictHostKeyChecking=no root@72.60.28.175 << 'ENDSSH'
set -e

echo "📦 Deploying events fix to production..."

# Navigate to project
cd /opt/stepperslife

# Pull latest changes
git pull origin main

# Stop old container
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# Build with fixed configuration
docker build -t stepperslife:latest .

# Run with correct environment
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PLATFORM_FEE_PER_TICKET=1.50 \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ \
  -e CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq \
  -e NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud \
  -e CONVEX_DEPLOYMENT=prod:youthful-porcupine-760 \
  -e NEXT_PUBLIC_APP_URL=https://stepperslife.com \
  -e NEXT_PUBLIC_APP_NAME=SteppersLife \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE \
  -e DATABASE_URL=file:./dev.db \
  stepperslife:latest

# Wait for container to start
sleep 10

# Check status
docker ps | grep stepperslife-prod

echo "✅ Deployment complete!"
ENDSSH

echo "🎉 Events page fix deployed successfully!"