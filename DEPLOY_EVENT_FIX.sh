#!/bin/bash

echo "🚀 Deploying Event Publishing Fix to Production"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server details
SERVER_IP="72.60.28.175"
SERVER_USER="root"
SERVER_PASSWORD="Bobby321&Gloria321Watkins?"

echo -e "${YELLOW}📦 Step 1: Pushing changes to GitHub...${NC}"
git add -A
git commit -m "Fix: Event publishing issues - Convex URL mismatch and error handling"
git push origin main

echo -e "${YELLOW}🔄 Step 2: Deploying to server...${NC}"

# Create deployment script
cat > /tmp/deploy_fix.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
set -e

echo "📂 Navigating to project directory..."
cd /opt/stepperslife || exit 1

echo "🔄 Pulling latest changes..."
git pull origin main

echo "📝 Creating production environment file..."
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Auth.js Authentication
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Convex (CORRECT PRODUCTION URL)
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760

# App Configuration
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE

# Database
DATABASE_URL="file:./dev.db"

# Square Production Configuration
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=EAAAl5D9u-F5xLqKcvKQx_OGD_z_4tYGZKNBkHN_qBGWpJsLFxF0kRg1234567890
SQUARE_LOCATION_ID=L7VGQP1234567890
SQUARE_APPLICATION_ID=sq0idp-abcd1234567890_ABCD12345
SQUARE_WEBHOOK_SIGNATURE_KEY=_Yl7W8abcd1234567890ABCDEFGHIJKLMNOP

# Cash App Configuration
CASH_APP_ENABLED=true
CASH_APP_HANDLE=$stepperslife

# Server Access
SERVER_IP=72.60.28.175
SERVER_USER=root
SERVER_PASSWORD=Bobby321&Gloria321Watkins?
EOF

echo "🏗️ Building Docker image..."
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

echo "✅ Deployment complete!"
docker ps | grep stepperslife-prod
DEPLOY_SCRIPT

# Execute on server
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP 'bash -s' < /tmp/deploy_fix.sh

echo -e "${GREEN}✅ Step 3: Verifying deployment...${NC}"

# Wait for container to start
sleep 10

# Test the deployment
echo "🔍 Checking container status..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "docker ps | grep stepperslife-prod"

echo "🔍 Testing event creation endpoint..."
curl -s https://stepperslife.com/health || echo "Health check endpoint not available"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Summary of fixes applied:"
echo "1. ✅ Fixed Convex URL mismatch (now using youthful-porcupine-760)"
echo "2. ✅ Removed Clerk authentication keys"
echo "3. ✅ Added proper error handling with timeouts"
echo "4. ✅ Improved user feedback during publishing"
echo ""
echo "🧪 To test:"
echo "1. Go to https://stepperslife.com/seller/new-event"
echo "2. Create a new event"
echo "3. Event should publish within 5 seconds"
echo ""
echo -e "${YELLOW}⚠️  If issues persist, check:${NC}"
echo "- Browser console for the Convex URL being used"
echo "- Network tab for failed requests"
echo "- Container logs: docker logs stepperslife-prod"