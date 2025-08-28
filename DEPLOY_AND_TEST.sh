#!/bin/bash

# Deploy and Test Script - Run this locally to deploy to production
echo "🚀 SteppersLife Production Deployment & Test"
echo "==========================================="
echo ""

# SSH and deploy in one command
echo "📦 Deploying to production server..."
ssh root@72.60.28.175 << 'ENDSSH'
cd /opt && rm -rf stepperslife
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife
chmod +x DEPLOY_FINAL.sh
./DEPLOY_FINAL.sh
ENDSSH

echo ""
echo "⏳ Waiting 30 seconds for deployment to complete..."
sleep 30

echo ""
echo "🧪 Testing deployment..."
echo ""

# Test 1: Check if container is running
echo -n "1. Container Status: "
ssh root@72.60.28.175 "docker ps | grep stepperslife-prod" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Running"
else
    echo "❌ Not Running"
fi

# Test 2: Check environment variables
echo -n "2. Environment Variables: "
ENV_CHECK=$(curl -s https://stepperslife.com/api/auth/providers | jq -r '.providers.google.configured')
if [ "$ENV_CHECK" = "true" ]; then
    echo "✅ Loaded Correctly"
else
    echo "❌ Not Loaded (Google OAuth: $ENV_CHECK)"
fi

# Test 3: Check HTTPS
echo -n "3. HTTPS Configuration: "
AUTH_URL=$(curl -s https://stepperslife.com/api/auth/providers | jq -r '.authUrl')
if [[ "$AUTH_URL" == "https://"* ]]; then
    echo "✅ Correct ($AUTH_URL)"
else
    echo "❌ Wrong ($AUTH_URL)"
fi

# Test 4: Google OAuth Status
echo -n "4. Google OAuth: "
GOOGLE_STATUS=$(curl -s https://stepperslife.com/api/auth/providers | jq -r '.providers.google.status')
if [[ "$GOOGLE_STATUS" == "ready" ]]; then
    echo "✅ Ready"
else
    echo "❌ $GOOGLE_STATUS"
fi

# Test 5: Homepage Content
echo -n "5. Homepage Content: "
if curl -s https://stepperslife.com | grep -q "SteppersLife"; then
    echo "✅ Correct"
else
    echo "❌ Wrong Content"
fi

echo ""
echo "📊 Full OAuth Provider Status:"
curl -s https://stepperslife.com/api/auth/providers | jq '.providers.google'

echo ""
echo "🔗 Test Links:"
echo "- Homepage: https://stepperslife.com"
echo "- Sign In: https://stepperslife.com/auth/signin"
echo "- Create Event: https://stepperslife.com/seller/new-event"