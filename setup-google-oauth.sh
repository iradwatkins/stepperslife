#!/bin/bash

# Setup Google OAuth for SteppersLife
# This script configures Google OAuth credentials in production

echo "================================================"
echo "GOOGLE OAUTH SETUP FOR STEPPERSLIFE"
echo "================================================"
echo ""
echo "Before running this script, you need:"
echo "1. Google Client ID from https://console.cloud.google.com"
echo "2. Google Client Secret"
echo ""
echo "The redirect URI must be:"
echo "https://stepperslife.com/api/auth/callback/google"
echo ""
read -p "Do you have these credentials ready? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please get credentials first from Google Console"
    exit 1
fi

# Get credentials from user
echo ""
read -p "Enter Google Client ID: " GOOGLE_CLIENT_ID
read -s -p "Enter Google Client Secret: " GOOGLE_CLIENT_SECRET
echo ""

# Validate inputs
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "Error: Credentials cannot be empty"
    exit 1
fi

# Create deployment script
cat > /tmp/deploy-google-auth.sh << EOF
#!/bin/bash
# Deploy Google OAuth to production

echo "Deploying to production server..."

ssh root@72.60.28.175 << 'DEPLOY'
set -e

echo "Setting up Google OAuth..."

# Create environment file
cat > /opt/google-auth.env << 'ENVFILE'
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=YC4H/yZ0wC+1O9M7fQZeNauGk=
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621
ENVFILE

# Stop existing container
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# Run with Google OAuth configured
docker run -d \\
  --name stepperslife-prod \\
  --restart unless-stopped \\
  --network coolify \\
  -p 3000:3000 \\
  --env-file /opt/google-auth.env \\
  --label "traefik.enable=true" \\
  --label "traefik.http.routers.stepperslife.rule=Host(\\\`stepperslife.com\\\`)" \\
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \\
  stepperslife:v3.1.0

echo "Waiting for container to start..."
sleep 10

# Verify
echo "Verifying Google OAuth setup..."
curl -s http://localhost:3000/api/auth/providers | grep -q '"google"' && echo "✅ Google OAuth configured" || echo "❌ Configuration failed"

DEPLOY
EOF

# Make executable and run
chmod +x /tmp/deploy-google-auth.sh

echo ""
echo "================================================"
echo "Ready to deploy Google OAuth"
echo "================================================"
echo "Client ID: ${GOOGLE_CLIENT_ID:0:20}..."
echo "Secret: [HIDDEN]"
echo ""
read -p "Deploy now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    /tmp/deploy-google-auth.sh
    
    echo ""
    echo "Testing deployment..."
    sleep 5
    
    # Test the endpoint
    if curl -s https://stepperslife.com/api/auth/providers 2>/dev/null | grep -q '"google"'; then
        echo "✅ Google OAuth successfully configured!"
        echo ""
        echo "You can now sign in with Google at:"
        echo "https://stepperslife.com/auth/signin"
    else
        echo "⚠️ Deployment may still be in progress"
        echo "Check in a few seconds at:"
        echo "https://stepperslife.com/api/auth/providers"
    fi
else
    echo "Deployment cancelled"
    echo "Run the script again when ready"
fi

echo ""
echo "================================================"