#!/bin/bash
# Quick deployment script for SteppersLife v3.1.0

echo "🚀 Starting SteppersLife v3.1.0 Deployment"

# Stop any existing containers
docker stop stepperslife-app 2>/dev/null || true
docker rm stepperslife-app 2>/dev/null || true

# Run the container
docker run -d \
  --name stepperslife-app \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e NEXT_PUBLIC_BUILD_VERSION=3.1.0 \
  -e PLATFORM_FEE_PER_TICKET=1.50 \
  -e NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud \
  -e CONVEX_DEPLOYMENT=prod:mild-newt-621 \
  -e NEXTAUTH_URL=http://localhost:3000 \
  stepperslife:v3.1.0

echo "✅ Container started"
echo "Checking health..."
sleep 5

if curl -s http://localhost:3000/health | grep -q "healthy"; then
  echo "✅ Application is healthy!"
  echo "Version: $(curl -s http://localhost:3000/version | grep -o '"version":"[^"]*"' | cut -d'"' -f4)"
else
  echo "⚠️ Health check failed, checking logs..."
  docker logs --tail 20 stepperslife-app
fi

echo "📝 Access at: http://localhost:3000"