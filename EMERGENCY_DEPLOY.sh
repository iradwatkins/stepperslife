#!/bin/bash

echo "🚨 EMERGENCY DEPLOYMENT SCRIPT"
echo "=============================="
echo ""
echo "This script provides alternative deployment methods when SSH fails."
echo ""

# Method 1: Direct server access workaround
echo "📋 OPTION 1: Direct Server Access"
echo "If you can access the server directly, run these commands:"
echo ""
echo "ssh root@72.60.28.175"
echo "cd /opt/stepperslife"
echo "git pull origin main"
echo "docker build --no-cache -t stepperslife:latest ."
echo "docker stop stepperslife-prod && docker rm stepperslife-prod"
echo "docker run -d --name stepperslife-prod --restart unless-stopped -p 3000:3000 --env-file .env.production stepperslife:latest"
echo ""

# Method 2: Access via IP directly
echo "📋 OPTION 2: Direct IP Access (Bypass Cloudflare)"
echo "Access the site directly at: http://72.60.28.175:3000"
echo ""

# Method 3: Cloudflare bypass
echo "📋 OPTION 3: Cloudflare Development Mode"
echo "1. Log into Cloudflare dashboard"
echo "2. Go to stepperslife.com settings"
echo "3. Enable 'Development Mode' to bypass cache"
echo "4. Wait 5 minutes for propagation"
echo ""

# Method 4: Alternative deployment via webhook
echo "📋 OPTION 4: GitHub Actions Manual Trigger"
echo "1. Go to: https://github.com/iradwatkins/stepperslife/actions"
echo "2. Click on 'Deploy to Production Server' workflow"
echo "3. Click 'Run workflow' button"
echo "4. Select 'main' branch and click 'Run workflow'"
echo ""

# Method 5: Container restart via Dokploy
echo "📋 OPTION 5: Dokploy Dashboard"
echo "1. Access Dokploy at: http://72.60.28.175:3000"
echo "2. Find the stepperslife application"
echo "3. Click 'Restart' or 'Redeploy'"
echo ""

echo "🔍 Checking current site status..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://stepperslife.com)
echo "Current HTTPS Status Code: $RESPONSE"

if [ "$RESPONSE" = "502" ]; then
    echo "❌ Site is currently showing 502 Bad Gateway"
    echo "🔧 Recommended: Try OPTION 2 first (Direct IP Access)"
else
    echo "✅ Site appears to be responding (Status: $RESPONSE)"
fi

echo ""
echo "📝 To make this script executable: chmod +x EMERGENCY_DEPLOY.sh"