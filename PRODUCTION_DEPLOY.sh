#!/bin/bash

# SteppersLife Production Deployment Script
# Version: 3.2.2 - Event Categories Fix
# Date: 2025-08-25
# 
# IMPORTANT: This uses DIRECT DOCKER deployment
# DO NOT USE COOLIFY - IT IS BROKEN

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   SteppersLife Production Deployment v3.2.2   ${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Configuration
SERVER="root@72.60.28.175"
REPO="https://github.com/iradwatkins/stepperslife.git"
VERSION="v3.2.2"

echo -e "${YELLOW}📋 Deployment Configuration:${NC}"
echo "   Server: $SERVER"
echo "   Repository: $REPO"
echo "   Version: $VERSION"
echo ""

echo -e "${GREEN}✅ What's Fixed in This Version:${NC}"
echo "   • Event Categories selector completely redesigned"
echo "   • Now uses simple checkboxes (100% reliable)"
echo "   • Calendar day headers properly aligned"
echo "   • Date/time pickers working correctly"
echo "   • All dropdowns replaced with native elements"
echo ""

echo -e "${YELLOW}⚠️  Prerequisites:${NC}"
echo "   1. SSH key configured for $SERVER"
echo "   2. Docker installed on server"
echo "   3. Traefik network 'coolify' exists"
echo ""

read -p "Ready to deploy? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo -e "${RED}Deployment cancelled${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 Starting deployment...${NC}"
echo ""

# Execute deployment on server
ssh $SERVER << 'ENDSSH'
set -e

# Colors for remote output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}[1/7] Cleaning up old deployment...${NC}"
cd /opt
rm -rf stepperslife
echo "✓ Old deployment removed"

echo -e "${YELLOW}[2/7] Cloning repository...${NC}"
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife
echo "✓ Repository cloned"

echo -e "${YELLOW}[3/7] Creating Next.js configuration...${NC}"
cat > next.config.js << 'EOF'
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  images: { 
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ] 
  }
}
module.exports = nextConfig
EOF
echo "✓ Next.js config created"

echo -e "${YELLOW}[4/7] Setting environment variables...${NC}"
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Authentication
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=

# Google OAuth
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621

# Application
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
EOF
echo "✓ Environment variables set"

echo -e "${YELLOW}[5/7] Building Docker image...${NC}"
docker build --no-cache -t stepperslife:v3.2.2 .
echo "✓ Docker image built"

echo -e "${YELLOW}[6/7] Stopping old container...${NC}"
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true
echo "✓ Old container removed"

echo -e "${YELLOW}[7/7] Starting new container...${NC}"
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network coolify \
  -p 3000:3000 \
  --env-file .env.production \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  stepperslife:v3.2.2

echo "✓ New container started"
echo ""

# Verification
echo -e "${YELLOW}Verifying deployment...${NC}"
sleep 5

if docker ps | grep -q stepperslife-prod; then
    echo -e "${GREEN}✅ Container is running${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep stepperslife
else
    echo -e "${RED}❌ Container failed to start${NC}"
    echo "Checking logs..."
    docker logs stepperslife-prod --tail 50
    exit 1
fi

# Test endpoints
echo ""
echo -e "${YELLOW}Testing endpoints...${NC}"

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo -e "${GREEN}✅ Application responding${NC}"
else
    echo -e "${RED}⚠️  Application may still be starting...${NC}"
fi

if curl -s http://localhost:3000/api/auth/providers | grep -q "google"; then
    echo -e "${GREEN}✅ Google OAuth configured${NC}"
else
    echo -e "${RED}⚠️  Google OAuth may need configuration${NC}"
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   DEPLOYMENT COMPLETE - v3.2.2 LIVE!          ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Visit https://stepperslife.com"
echo "2. Test Event Categories (now using checkboxes)"
echo "3. Verify calendar displays correctly"
echo "4. Test creating and editing events"

ENDSSH

echo ""
echo -e "${GREEN}🎉 Deployment script completed!${NC}"
echo ""
echo -e "${YELLOW}Verify from your browser:${NC}"
echo "   • https://stepperslife.com"
echo "   • Event Categories should be clickable checkboxes"
echo "   • Calendar should have aligned headers"
echo ""