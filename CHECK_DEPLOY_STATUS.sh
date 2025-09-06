#!/bin/bash

echo "🔍 Checking deployment status..."

# Server details
SERVER_IP="72.60.28.175"
SERVER_USER="root"
SERVER_PASSWORD='Bobby321&Gloria321Watkins?'

# Check if container is running and get latest commit
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
echo "📦 Checking Docker container status..."
docker ps | grep stepperslife-prod

echo ""
echo "📝 Getting latest code commit..."
cd /opt/stepperslife
git log --oneline -1

echo ""
echo "🔄 Restarting container to ensure latest code..."
docker restart stepperslife-prod

echo ""
echo "⏳ Waiting for container to be ready..."
sleep 10

echo ""
echo "✅ Container status after restart:"
docker ps | grep stepperslife-prod

echo ""
echo "🎯 Testing image upload field..."
docker exec stepperslife-prod grep -r "object-contain" /app/.next/static 2>/dev/null | head -1
if [ $? -eq 0 ]; then
  echo "✅ Image fix is deployed!"
else
  echo "⚠️ Image fix might not be deployed yet"
fi
EOF

echo ""
echo "🌐 Deployment check complete!"
echo "Please clear your browser cache and refresh https://stepperslife.com/organizer/new-event"