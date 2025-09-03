#!/bin/bash

# Emergency deployment script for SteppersLife
echo "🚨 EMERGENCY DEPLOYMENT - Using simple container restart"

# Try to access the site directly
echo "Testing direct server access..."
if curl -s -o /dev/null -w "%{http_code}" http://72.60.28.175:3000 | grep -q "200"; then
    echo "✅ Server is accessible at http://72.60.28.175:3000"
else
    echo "⚠️ Server not responding on port 3000"
    echo "The container may need to be restarted manually"
fi

echo ""
echo "📝 Manual deployment instructions:"
echo "1. SSH to server: ssh root@72.60.28.175"
echo "2. Password: Bobby321&Gloria321Watkins?"
echo "3. Run these commands:"
echo ""
echo "cd /opt && rm -rf stepperslife"
echo "git clone https://github.com/iradwatkins/stepperslife.git"
echo "cd stepperslife"
echo "./DEPLOY_FINAL.sh"
echo ""
echo "Or use the direct access URL while Cloudflare is having issues:"
echo "http://72.60.28.175:3000"
