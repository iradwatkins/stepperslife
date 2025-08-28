#!/bin/bash

# Clear Port 3000 - SteppersLife Deployment Helper
# ================================================
# Use this when port 3000 is blocked by unknown processes

echo "🧹 Port 3000 Cleanup Script"
echo "==========================="
echo ""

# Show what's using port 3000
echo "📊 Current port 3000 usage:"
echo ""

# Check Docker containers
echo "Docker containers on port 3000:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}" | grep -E "3000|NAMES" || echo "None"
echo ""

# Check system processes
echo "System processes on port 3000:"
lsof -i :3000 2>/dev/null || echo "None (or no permission to check)"
echo ""

# Ask for confirmation
echo "⚠️  This will stop ALL processes using port 3000"
echo -n "Continue? (y/N): "
read -r response

if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🛑 Stopping containers..."

# Stop all Docker containers using port 3000
CONTAINERS=$(docker ps --format "{{.ID}}" --filter "publish=3000")
if [ ! -z "$CONTAINERS" ]; then
    for container in $CONTAINERS; do
        NAME=$(docker inspect --format='{{.Name}}' $container | sed 's/^\/\+//')
        echo "Stopping container: $NAME"
        docker stop $container
        docker rm $container 2>/dev/null || true
    done
fi

# Also specifically stop stepperslife containers
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true
docker stop stepperslife 2>/dev/null || true  
docker rm stepperslife 2>/dev/null || true

# Kill any remaining processes
echo ""
echo "🔪 Killing remaining processes..."
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true

# Wait a moment
sleep 2

# Verify
echo ""
echo "✅ Verification:"
echo ""

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ WARNING: Port 3000 is still in use!"
    lsof -i :3000
else
    echo "✅ Port 3000 is now free!"
fi

echo ""
echo "Docker containers still running:"
docker ps --format "table {{.Names}}\t{{.Ports}}" | head -20

echo ""
echo "Done! You can now deploy SteppersLife."