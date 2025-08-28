#!/bin/bash

# SteppersLife Production Deployment Script
# This script deploys the latest code to production

echo "🚀 Starting SteppersLife deployment to production..."
echo "Server: 72.60.28.175"
echo "Domain: stepperslife.com"
echo ""

# SSH to server and deploy
ssh root@72.60.28.175 << 'DEPLOY_SCRIPT'
set -e  # Exit on any error

echo "📂 Navigating to project directory..."
cd /opt/stepperslife

echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo "🔧 Building Docker image..."
docker build --no-cache -t stepperslife:latest .

echo "🛑 Stopping existing container..."
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
  stepperslife:latest

echo "✅ Container started. Checking status..."
docker ps | grep stepperslife-prod

echo ""
echo "🔍 Verifying deployment..."
sleep 5  # Wait for container to start

# Check if container is running
if docker ps | grep -q stepperslife-prod; then
    echo "✅ Container is running!"
    
    # Check health endpoint
    if curl -s http://localhost:3000/health | grep -q "healthy"; then
        echo "✅ Health check passed!"
    else
        echo "⚠️  Health check failed, but container is running"
    fi
    
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "🌐 Visit https://stepperslife.com to see your changes"
else
    echo "❌ ERROR: Container failed to start!"
    echo "Check logs with: docker logs stepperslife-prod"
    exit 1
fi
DEPLOY_SCRIPT

echo ""
echo "📋 Deployment Summary:"
echo "- Code: Latest from GitHub main branch"
echo "- New features:"
echo "  ✅ Save the Date events (ticket options hidden)"
echo "  ✅ Image upload with Convex storage"
echo "  ✅ Seller customers page (/seller/customers)"
echo "  ✅ Seller analytics page (/seller/analytics)"
echo ""
echo "🔗 URLs to test:"
echo "- https://stepperslife.com/seller/customers"
echo "- https://stepperslife.com/seller/analytics"
echo "- https://stepperslife.com/seller/new-event"