#!/bin/bash

echo "🚨 EMERGENCY: FIXING 502 BAD GATEWAY"
echo "===================================="

# Server details
SERVER_IP="72.60.28.175"
SERVER_USER="root"
SERVER_PASSWORD="Bobby321&Gloria321Watkins?"

cat > /tmp/emergency_502.sh << 'EMERGENCY'
#!/bin/bash

echo "🔍 Checking container status..."
docker ps -a | grep stepperslife

echo "📋 Checking Docker logs..."
docker logs stepperslife-final --tail 50 2>&1 || echo "No logs from stepperslife-final"

echo "🔄 Restarting container..."
cd /opt/stepperslife

# Ensure proper environment file
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Clerk Authentication (Keep temporarily)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq

# Auth.js Authentication  
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760

# App Configuration
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
DATABASE_URL="file:./dev.db"
EOF

# Ensure docker-entrypoint.sh is correct
cat > docker-entrypoint.sh << 'ENTRYPOINT'
#!/bin/sh
export HOSTNAME=0.0.0.0
echo "Starting SteppersLife application..."
exec node server.js
ENTRYPOINT
chmod +x docker-entrypoint.sh

# Clean up all containers
echo "🧹 Cleaning up old containers..."
docker stop $(docker ps -q --filter name=stepperslife) 2>/dev/null || true
docker rm $(docker ps -aq --filter name=stepperslife) 2>/dev/null || true

# Quick rebuild
echo "🏗️ Rebuilding application..."
docker build -t stepperslife:emergency . || {
    echo "❌ Build failed, trying with cache..."
    docker build -t stepperslife:emergency .
}

# Start fresh container
echo "🚀 Starting fresh container..."
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
  stepperslife:emergency

echo "⏳ Waiting for container..."
sleep 10

echo "✅ Checking status..."
docker ps | grep stepperslife-prod

echo "🔍 Testing locally..."
curl -I http://localhost:3000 2>&1 | head -5

echo "📋 Container logs:"
docker logs stepperslife-prod --tail 20
EMERGENCY

echo "🚀 Executing emergency fix..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP 'bash -s' < /tmp/emergency_502.sh

echo ""
echo "✅ Emergency fix deployed!"
echo "Check: https://stepperslife.com"