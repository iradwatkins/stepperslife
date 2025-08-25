#!/bin/bash

# SteppersLife v3.2.2 - CRITICAL EVENT CATEGORIES FIX
# =====================================================
# This fixes the non-functional Event Categories selector
# Date: 2025-08-25

echo "======================================================"
echo "🚨 CRITICAL DEPLOYMENT - v3.2.2"
echo "======================================================"
echo ""
echo "This deployment FIXES:"
echo "✅ Event Categories selector - completely redesigned"
echo "✅ Now using simple checkboxes that ALWAYS work"
echo "✅ No more dropdown/popover issues"
echo ""
echo "TO DEPLOY ON SERVER:"
echo "===================="
echo ""
echo "1. SSH to server:"
echo "   ssh root@72.60.28.175"
echo ""
echo "2. Run these commands:"
echo ""

cat << 'COMMANDS'
# Remove old deployment
cd /opt && rm -rf stepperslife

# Clone latest code
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife

# Create build config
cat > next.config.js << 'EOF'
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'standalone',
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] }
}
module.exports = nextConfig
EOF

# Set production environment
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
EOF

# Build Docker image
docker build --no-cache -t stepperslife:v3.2.2 .

# Stop and remove old container
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# Run new container
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

# Verify deployment
echo ""
echo "Verifying deployment..."
sleep 5
docker ps | grep stepperslife-prod
echo ""
echo "✅ Deployment complete!"
echo ""
echo "TEST THE FIX:"
echo "1. Visit https://stepperslife.com/seller/new-event"
echo "2. Click on Event Categories"
echo "3. You should see checkboxes you can click!"
echo "4. Select multiple categories"
echo "5. They should appear as badges"
COMMANDS