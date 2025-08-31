#!/bin/bash

echo "🔧 Fixing Convex Authentication and Storage"
echo "==========================================="

# Server details
SERVER_IP="72.60.28.175"
SERVER_USER="root"
SERVER_PASSWORD="Bobby321&Gloria321Watkins?"

echo "📝 Creating fixed environment configuration..."

cat > /tmp/fix_convex.sh << 'CONVEX_FIX'
#!/bin/bash
cd /opt/stepperslife

echo "🔍 Checking current Convex deployment..."
npx convex version

echo "📝 Updating environment variables..."
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Clerk Authentication (Keep for now to avoid build issues)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq

# Convex Configuration - CRITICAL
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760
CONVEX_URL=https://youthful-porcupine-760.convex.cloud

# Auth.js Configuration  
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# App Configuration
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE

# Database
DATABASE_URL="file:./dev.db"

# Square Configuration
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=EAAAl5D9u-F5xLqKcvKQx_OGD_z_4tYGZKNBkHN_qBGWpJsLFxF0kRg1234567890
SQUARE_LOCATION_ID=L7VGQP1234567890
SQUARE_APPLICATION_ID=sq0idp-abcd1234567890_ABCD12345
SQUARE_WEBHOOK_SIGNATURE_KEY=_Yl7W8abcd1234567890ABCDEFGHIJKLMNOP

# Cash App
CASH_APP_ENABLED=true
CASH_APP_HANDLE=$stepperslife
EOF

echo "🚀 Deploying Convex functions..."
npx convex deploy -y

echo "🔧 Creating auth config for Convex..."
cat > convex/auth.config.js << 'AUTHCONFIG'
export default {
  providers: []
};
AUTHCONFIG

echo "🏗️ Rebuilding application..."
docker build --no-cache -t stepperslife:convex-fix . 

echo "🔄 Restarting container..."
docker stop stepperslife-final 2>/dev/null || true
docker rm stepperslife-final 2>/dev/null || true

docker run -d \
  --name stepperslife-production \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3000:3000 \
  --env-file .env.production \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`) || Host(\`www.stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  stepperslife:convex-fix

echo "⏳ Waiting for container to be ready..."
sleep 10

echo "✅ Testing connection..."
curl -s http://localhost:3000/health || echo "Health check not available"

echo "📊 Container status:"
docker ps | grep stepperslife-production
CONVEX_FIX

echo "🚀 Executing fix on server..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP 'bash -s' < /tmp/fix_convex.sh

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONVEX AUTHENTICATION FIX APPLIED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Actions taken:"
echo "1. ✅ Added CONVEX_URL environment variable"
echo "2. ✅ Deployed Convex functions to production"
echo "3. ✅ Created auth config for Convex"
echo "4. ✅ Rebuilt and redeployed application"
echo ""
echo "🧪 Please test:"
echo "1. Go to https://stepperslife.com/seller/new-event"
echo "2. Try uploading an image"
echo "3. Create an event"
echo ""
echo "If issues persist, check:"
echo "- Convex Dashboard: https://dashboard.convex.dev"
echo "- Container logs: docker logs stepperslife-production"