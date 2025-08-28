#!/bin/bash

# EMERGENCY FIX - Production Environment Variables
# ===============================================
# The production server is NOT loading environment variables properly!

echo "🚨 EMERGENCY ENV FIX for SteppersLife Production"
echo "=============================================="
echo ""
echo "PROBLEM FOUND:"
echo "- authUrl showing HTTP instead of HTTPS"
echo "- Google OAuth credentials showing as 'missing'"
echo "- Environment variables NOT being loaded"
echo ""
echo "TO FIX ON SERVER:"
echo ""
echo "ssh root@72.60.28.175"
echo ""
echo "Then run these commands:"
echo ""
cat << 'COMMANDS'
# 1. Check current container environment
echo "Current container environment:"
docker exec stepperslife-prod env | grep -E "(GOOGLE|NEXTAUTH|NODE_ENV)" | sort

# 2. Stop current container
docker stop stepperslife-prod
docker rm stepperslife-prod

# 3. Run with environment variables properly injected
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
  stepperslife:latest

# 4. Verify environment is now correct
sleep 5
echo ""
echo "Verifying environment variables are loaded:"
docker exec stepperslife-prod env | grep -E "(GOOGLE|NEXTAUTH)" | head -5

# 5. Test the fix
echo ""
echo "Testing OAuth configuration:"
curl -s https://stepperslife.com/api/auth/providers | jq '.providers.google'
COMMANDS