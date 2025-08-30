#!/bin/bash

echo "🚀 SteppersLife Production Deployment with Events Fix"
echo "=========================================="
echo "Deploying with Clerk Auth + Correct Convex Database"
echo "Database contains 9 real production events"
echo ""

# Server configuration
SERVER_IP="72.60.28.175"
SERVER_PASSWORD='Bobby321&Gloria321Watkins?'

# Deploy to server
echo "📦 Deploying to production server..."

sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no root@${SERVER_IP} << 'DEPLOY_SCRIPT'
set -e

echo "🔄 Starting deployment on server..."

# Navigate to deployment directory
cd /opt
rm -rf stepperslife
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife

echo "📝 Creating production environment file..."
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq
# Convex PRODUCTION (Contains 9 events!)
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760
# App Config
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
DATABASE_URL=file:./dev.db
DISABLE_SQUARE=true
EOF

echo "🐳 Building Docker image..."
docker build --no-cache -t stepperslife:latest . || {
    echo "❌ Docker build failed"
    exit 1
}

echo "🛑 Stopping old container..."
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

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

echo "⏳ Waiting for container to start..."
sleep 10

echo "✅ Verifying deployment..."
if docker ps | grep stepperslife-prod > /dev/null; then
    echo "✅ Container is running"
    
    # Check internal health
    if curl -f http://localhost:3000/api/health 2>/dev/null; then
        echo "✅ Health check passed internally"
    else
        echo "⚠️ Internal health check failed, but container is running"
    fi
    
    # Show container logs
    echo ""
    echo "📋 Recent container logs:"
    docker logs stepperslife-prod --tail 20
else
    echo "❌ Container failed to start"
    docker logs stepperslife-prod --tail 50
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
DEPLOY_SCRIPT

echo ""
echo "🔍 Testing production endpoints..."
sleep 5

# Test health endpoint
echo "Testing https://stepperslife.com/api/health"
curl -s https://stepperslife.com/api/health | head -n 5 || echo "Health check pending..."

echo ""
echo "✅ Deployment script completed. Site should be live at https://stepperslife.com"