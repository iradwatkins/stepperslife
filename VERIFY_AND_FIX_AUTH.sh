#!/bin/bash

# Comprehensive Auth Verification and Fix Script
echo "🔍 SteppersLife Authentication Verification & Fix"
echo "=============================================="
echo ""

# 1. Check local environment file
echo "📋 Step 1: Checking local .env.local file..."
if [ -f .env.local ]; then
    echo "Found .env.local with:"
    grep -E "GOOGLE_CLIENT|NEXTAUTH_URL" .env.local | sed 's/=.*$/=<hidden>/'
else
    echo "❌ No .env.local file found"
fi

# 2. Check production environment file
echo ""
echo "📋 Step 2: Checking .env.production file..."
if [ -f .env.production ]; then
    echo "Found .env.production with:"
    grep -E "GOOGLE_CLIENT|NEXTAUTH_URL" .env.production | head -5
else
    echo "❌ No .env.production file found"
fi

# 3. Verify Google OAuth credentials
echo ""
echo "🔐 Step 3: Verifying Google OAuth Setup..."
echo ""
echo "Expected values from CLAUDE.md:"
echo "GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com"
echo "GOOGLE_CLIENT_SECRET=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"
echo "NEXTAUTH_URL=https://stepperslife.com"

# 4. Create verified .env.production
echo ""
echo "✅ Step 4: Creating verified .env.production..."
cat > .env.production << 'EOF'
# Production Environment Variables - Verified from CLAUDE.md
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Auth.js Configuration (HTTPS is critical!)
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=

# Google OAuth (from CLAUDE.md)
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Convex Configuration
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621

# Application Settings
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE

# Database
DATABASE_URL="file:./dev.db"
EOF

echo "Created .env.production with all required variables"

# 5. Test current production status
echo ""
echo "🌐 Step 5: Current Production Status..."
echo -n "Google OAuth: "
GOOGLE_STATUS=$(curl -s https://stepperslife.com/api/auth/providers | jq -r '.providers.google.configured')
if [ "$GOOGLE_STATUS" = "true" ]; then
    echo "✅ Configured"
else
    echo "❌ Not Configured"
fi

echo -n "Auth URL: "
AUTH_URL=$(curl -s https://stepperslife.com/api/auth/providers | jq -r '.authUrl')
echo "$AUTH_URL"

# 6. Show deployment command
echo ""
echo "🚀 Step 6: To Deploy The Fix..."
echo ""
echo "Run this command:"
echo ""
echo "ssh root@72.60.28.175 << 'EOF'"
echo "cd /opt && rm -rf stepperslife"
echo "git clone https://github.com/iradwatkins/stepperslife.git"
echo "cd stepperslife"
echo ""
echo "# Ensure environment variables are set"
echo "cat > .env.production << 'ENVEOF'"
cat .env.production
echo "ENVEOF"
echo ""
echo "# Run deployment"
echo "chmod +x DEPLOY_FINAL.sh"
echo "./DEPLOY_FINAL.sh"
echo "EOF"

# 7. Test command
echo ""
echo "📊 After deployment, test with:"
echo "curl -s https://stepperslife.com/api/auth/providers | jq '.providers.google'"