#!/bin/bash

# Emergency Restart Script for SteppersLife
# Use when site shows 502 Bad Gateway

echo "🚨 EMERGENCY RESTART FOR STEPPERSLIFE"
echo "======================================"
echo ""
echo "This script will restart the Docker container when SSH is available."
echo ""

# Server details (no secrets in this file)
SERVER_IP="72.60.28.175"
SERVER_USER="root"

echo "📡 Checking server connectivity..."
if ping -c 1 $SERVER_IP &> /dev/null; then
    echo "✅ Server is reachable"
else
    echo "❌ Server is not reachable. Check your internet connection."
    exit 1
fi

echo ""
echo "🔑 Attempting SSH connection..."
echo "When prompted, enter the server password."
echo ""

# SSH commands to restart the container
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
echo "📦 Checking Docker containers..."
docker ps -a | grep -i steppers

echo ""
echo "🔄 Restarting SteppersLife container..."

# Stop and remove old container
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# Check if image exists
if docker images | grep -q "stepperslife"; then
    echo "✅ SteppersLife image found"
    
    # Start new container
    docker run -d \
      --name stepperslife-prod \
      --restart unless-stopped \
      --network dokploy-network \
      -p 3000:3000 \
      --env-file /opt/stepperslife/.env.production \
      --label "traefik.enable=true" \
      --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`) || Host(\`www.stepperslife.com\`)" \
      --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
      stepperslife:latest
    
    echo "✅ Container started"
    
    # Verify it's running
    sleep 3
    docker ps | grep stepperslife-prod
    
    # Test the endpoint
    echo ""
    echo "🔍 Testing local endpoint..."
    curl -s http://localhost:3000/api/health | head -20
else
    echo "❌ SteppersLife image not found. Need to rebuild."
    echo "Run the full deployment script instead."
fi
ENDSSH

echo ""
echo "🎉 Restart complete!"
echo "Check https://stepperslife.com in a few seconds."