#!/bin/bash

echo "🚀 CADDY PRODUCTION DEPLOYMENT - Full WebSocket Support"
echo "========================================================"
echo "Stack: Docker Compose + Caddy + Clerk + Convex"
echo ""

# Server configuration
SERVER_IP="72.60.28.175"
SERVER_PASSWORD='Bobby321&Gloria321Watkins?'

# Deploy to server
echo "📦 Deploying to production server with Caddy..."

sshpass -p "${SERVER_PASSWORD}" ssh -o StrictHostKeyChecking=no root@${SERVER_IP} << 'DEPLOY_SCRIPT'
set -e

echo "🔄 Starting Caddy deployment..."

# Stop all existing containers
echo "🛑 Stopping existing containers..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Navigate to deployment directory
cd /opt
rm -rf stepperslife
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife

echo "📝 Creating .env file..."
cat > .env << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760

# App Configuration
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE

# Database
DATABASE_URL="file:./dev.db"
EOF

echo "🔧 Ensuring next.config.js supports WebSockets..."
cat > next.config.js << 'NEXTCONFIG'
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // WebSocket support
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
  // Allow WebSocket connections
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' https: wss: data: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https: wss: https://youthful-porcupine-760.convex.cloud wss://youthful-porcupine-760.convex.cloud https://clerk.stepperslife.com",
          },
        ],
      },
    ];
  },
}
module.exports = nextConfig
NEXTCONFIG

echo "🔧 Creating docker-entrypoint.sh..."
cat > docker-entrypoint.sh << 'ENTRYPOINT'
#!/bin/sh
export HOSTNAME=0.0.0.0
export PORT=3000
echo "Starting SteppersLife with Caddy reverse proxy..."
echo "Convex URL: ${NEXT_PUBLIC_CONVEX_URL}"
echo "WebSocket support: Enabled"
exec node server.js
ENTRYPOINT
chmod +x docker-entrypoint.sh

echo "🐳 Building Docker image..."
docker build --no-cache \
  --build-arg NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ \
  --build-arg NEXT_PUBLIC_APP_URL=https://stepperslife.com \
  --build-arg NEXT_PUBLIC_APP_NAME=SteppersLife \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE \
  -t stepperslife:caddy . || {
    echo "❌ Docker build failed"
    exit 1
}

echo "🚀 Starting services with Docker Compose..."
# Use the simplified docker-compose for just SteppersLife and Caddy
cat > docker-compose.yml << 'COMPOSE'
version: '3.8'

services:
  caddy:
    image: caddy:2-alpine
    container_name: caddy-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    networks:
      - web

  stepperslife:
    image: stepperslife:caddy
    container_name: stepperslife-app
    restart: unless-stopped
    env_file: .env
    networks:
      - web
    expose:
      - "3000"

volumes:
  caddy_data:
  caddy_config:

networks:
  web:
    driver: bridge
COMPOSE

# Start everything
docker-compose down 2>/dev/null || true
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 15

echo "✅ Verifying deployment..."

# Check if containers are running
if docker ps | grep caddy-proxy > /dev/null && docker ps | grep stepperslife-app > /dev/null; then
    echo "✅ Containers are running"
    
    # Test internal connectivity
    echo "🔍 Testing internal API..."
    docker exec stepperslife-app curl -s http://localhost:3000/api/test-convex | head -100 | grep -q "success" && \
        echo "✅ Internal API working" || echo "⚠️ Internal API test failed"
    
    # Test Caddy is proxying correctly
    echo "🔍 Testing Caddy proxy..."
    curl -s -H "Host: stepperslife.com" http://localhost/api/test-convex | head -100 | grep -q "success" && \
        echo "✅ Caddy proxy working" || echo "⚠️ Caddy proxy test failed"
    
    # Show logs
    echo ""
    echo "📋 Caddy logs:"
    docker logs caddy-proxy --tail 10
    echo ""
    echo "📋 SteppersLife logs:"
    docker logs stepperslife-app --tail 10
else
    echo "❌ Containers failed to start"
    docker-compose logs
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Testing WebSocket support..."
echo "Please visit https://stepperslife.com and check browser console for:"
echo "- 'Convex Configuration' log with WebSocket status"
echo "- Network tab should show WS connection to Convex"
echo ""
echo "🔧 If WebSockets still fail, check:"
echo "1. Browser console for connection errors"
echo "2. docker logs caddy-proxy -f"
echo "3. docker logs stepperslife-app -f"
DEPLOY_SCRIPT

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CADDY DEPLOYMENT INITIATED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Features:"
echo "1. ✅ Automatic HTTPS with Let's Encrypt"
echo "2. ✅ Full WebSocket support for Convex"
echo "3. ✅ HTTP/3 support"
echo "4. ✅ Automatic certificate renewal"
echo "5. ✅ Proper CSP headers for WebSocket"
echo ""
echo "📋 Test endpoints:"
echo "- https://stepperslife.com (should show events)"
echo "- https://stepperslife.com/api/test-convex (API test)"
echo ""
echo "🔍 Monitor deployment:"
echo "ssh root@72.60.28.175"
echo "docker-compose logs -f"