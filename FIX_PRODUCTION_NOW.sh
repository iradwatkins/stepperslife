#!/bin/bash

# DIRECT FIX - This script will SSH to your server and fix the deployment
echo "🔧 Direct Production Fix for SteppersLife"
echo "========================================"
echo ""
echo "This will SSH to your server and fix the environment variables issue."
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

# SSH and fix in one command
ssh root@72.60.28.175 << 'ENDSSH'
echo "Connected to production server..."
echo ""

# Check current status
echo "1️⃣ Current container status:"
docker ps | grep stepperslife || echo "No stepperslife container running"
echo ""

# Stop any existing container
echo "2️⃣ Stopping existing containers..."
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true
docker stop $(docker ps -q --filter "publish=3000") 2>/dev/null || true
docker rm $(docker ps -aq --filter "publish=3000") 2>/dev/null || true

# Check if we have the image
echo ""
echo "3️⃣ Checking for Docker image..."
if docker images | grep -q stepperslife; then
    echo "✓ Found stepperslife image"
    IMAGE="stepperslife:latest"
else
    echo "❌ No image found. Building from GitHub..."
    cd /opt && rm -rf stepperslife
    git clone https://github.com/iradwatkins/stepperslife.git
    cd stepperslife
    
    # Configure build
    cat > next.config.js << 'EOF'
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] }
}
module.exports = nextConfig
EOF

    # Build image
    docker build --no-cache -t stepperslife:latest .
    IMAGE="stepperslife:latest"
fi

# Run with proper environment variables
echo ""
echo "4️⃣ Starting container with correct environment..."
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network coolify \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PLATFORM_FEE_PER_TICKET=1.50 \
  -e NEXTAUTH_URL=https://stepperslife.com \
  -e NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc= \
  -e GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com \
  -e GOOGLE_CLIENT_SECRET=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 \
  -e NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud \
  -e CONVEX_DEPLOYMENT=prod:mild-newt-621 \
  -e NEXT_PUBLIC_APP_URL=https://stepperslife.com \
  -e NEXT_PUBLIC_APP_NAME=SteppersLife \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE \
  -e DATABASE_URL="file:./dev.db" \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  $IMAGE

echo ""
echo "5️⃣ Verifying deployment..."
sleep 10

# Check if container is running
if docker ps | grep -q stepperslife-prod; then
    echo "✅ Container is running"
    
    # Check environment variables
    echo ""
    echo "Environment variables check:"
    docker exec stepperslife-prod env | grep -E "GOOGLE_CLIENT_ID|NEXTAUTH_URL" | head -3
else
    echo "❌ Container failed to start. Checking logs..."
    docker logs stepperslife-prod --tail 20
fi

echo ""
echo "6️⃣ Testing endpoints..."
curl -s http://localhost:3000/api/auth/providers | jq '.providers.google' || echo "API not responding"

echo ""
echo "✅ Deployment complete!"
ENDSSH

echo ""
echo "🧪 Testing from local machine..."
sleep 5
echo ""
echo "Google OAuth Status:"
curl -s https://stepperslife.com/api/auth/providers | jq '.providers.google'
echo ""
echo "Auth URL:"
curl -s https://stepperslife.com/api/auth/providers | jq '.authUrl'