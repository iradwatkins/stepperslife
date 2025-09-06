#!/bin/bash

echo "🚀 Deploying image display fix to production..."

# Server details from CLAUDE.md
SERVER_IP="72.60.28.175"
SERVER_USER="root"
SERVER_PASSWORD='Bobby321&Gloria321Watkins?'

# SSH command with password
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'EOF'
echo "📦 Pulling latest code..."
cd /opt/stepperslife
git pull origin main

echo "🔨 Building Docker image..."
docker build -t stepperslife:latest .

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
  stepperslife:latest

echo "✅ Verifying deployment..."
docker ps | grep stepperslife-prod
echo "🎉 Deployment complete!"
EOF

echo "✨ Image display fix deployed successfully!"
echo "🌐 Please refresh https://stepperslife.com/organizer/new-event to see the changes"