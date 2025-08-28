#!/bin/bash

# Quick deployment status checker
echo "🔍 SteppersLife Deployment Status Check"
echo "======================================"
echo ""

# Check GitHub Actions
echo "📊 GitHub Actions Status:"
echo "Check: https://github.com/iradwatkins/stepperslife/actions"
echo ""

# Check production site
echo "🌐 Production Site Tests:"
echo -n "1. HTTPS Response: "
curl -s -o /dev/null -w "%{http_code}\n" https://stepperslife.com

echo -n "2. Google OAuth: "
if curl -s https://stepperslife.com/api/auth/providers 2>/dev/null | grep -q "google"; then
    echo "✅ Configured"
else
    echo "❌ Not found"
fi

echo -n "3. Site Content: "
if curl -s https://stepperslife.com | grep -q "SteppersLife"; then
    echo "✅ Showing SteppersLife"
else
    echo "❌ Not showing correct content"
fi

echo ""
echo "🔧 If deployment hasn't completed:"
echo "ssh root@72.60.28.175"
echo "cd /opt/stepperslife && ./DEPLOY_FINAL.sh"