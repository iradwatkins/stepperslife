#!/bin/bash

# SteppersLife Server Restart Script
# Use this when the server returns 503 errors

echo "================================================"
echo "SteppersLife Emergency Server Restart"
echo "================================================"

# Configuration
SERVER_IP="72.60.28.175"
APP_NAME="stepperslife"
GITHUB_REPO="https://github.com/iradwatkins/stepperslife.git"

echo "Checking server status..."

# Check if server is accessible
if ! ping -c 1 $SERVER_IP &> /dev/null; then
    echo "❌ Server is not responding to ping"
    echo "Manual intervention required on server"
    exit 1
fi

echo "✅ Server is reachable"

# Try to restart via different methods
echo "Attempting restart methods..."

# Method 1: Docker restart
echo "1. Trying Docker restart..."
ssh root@$SERVER_IP "docker restart \$(docker ps -aq --filter name=$APP_NAME)" 2>/dev/null || {
    echo "   Docker restart failed"
}

# Method 2: Docker compose restart
echo "2. Trying Docker Compose restart..."
ssh root@$SERVER_IP "cd /opt/$APP_NAME && docker-compose restart" 2>/dev/null || {
    echo "   Docker Compose restart failed"
}

# Method 3: Coolify API restart
echo "3. Trying Coolify restart..."
curl -X POST http://$SERVER_IP:8000/api/applications/restart \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$APP_NAME\"}" 2>/dev/null || {
    echo "   Coolify restart failed"
}

# Method 4: Emergency deployment
echo "4. Trying emergency deployment..."
if [ -f deploy-standalone.sh ]; then
    echo "   Running standalone deployment script..."
    scp deploy-standalone.sh root@$SERVER_IP:/tmp/ 2>/dev/null
    ssh root@$SERVER_IP "bash /tmp/deploy-standalone.sh" 2>/dev/null || {
        echo "   Standalone deployment failed"
    }
fi

echo ""
echo "Checking if server is back online..."
sleep 5

# Verify server is responding
if curl -s -o /dev/null -w "%{http_code}" https://stepperslife.com | grep -q "200\|301\|302"; then
    echo "✅ Server is back online!"
    VERSION=$(curl -s https://stepperslife.com/version | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
    echo "   Running version: $VERSION"
else
    echo "❌ Server is still not responding"
    echo ""
    echo "MANUAL FIX REQUIRED:"
    echo "1. SSH to server: ssh root@$SERVER_IP"
    echo "2. Check Docker: docker ps"
    echo "3. Run deployment: bash deploy-standalone.sh"
fi

echo "================================================"