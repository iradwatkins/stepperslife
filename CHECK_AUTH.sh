#!/bin/bash

echo "====================================="
echo "Auth Configuration Check"
echo "====================================="
echo ""

# Check current environment
echo "📍 Current Environment:"
echo "   NODE_ENV: ${NODE_ENV:-not set}"
echo "   NEXTAUTH_URL: ${NEXTAUTH_URL:-not set}"
echo ""

# Check if NEXTAUTH_SECRET is set
if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ NEXTAUTH_SECRET is not set!"
  echo "   Generating a secure secret..."
  echo "   Run: openssl rand -base64 32"
  openssl rand -base64 32
else
  echo "✅ NEXTAUTH_SECRET is set"
fi

echo ""
echo "📋 Required Environment Variables:"
echo ""

# Check production site
if [[ "$NEXTAUTH_URL" == *"https://"* ]]; then
  echo "✅ Production mode detected"
  echo ""
  echo "Required for production:"
  echo "  NEXTAUTH_URL=https://stepperslife.com"
  echo "  NEXTAUTH_SECRET=(32+ character secret)"
  echo "  NODE_ENV=production"
else
  echo "⚠️  Development mode"
  echo ""
  echo "Required for development:"
  echo "  NEXTAUTH_URL=http://localhost:3001"
  echo "  NEXTAUTH_SECRET=(any secret for dev)"
fi

echo ""
echo "📝 Current .env.production should contain:"
echo "====================================="
cat << 'EOF'
NODE_ENV=production
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=<use output from: openssl rand -base64 32>
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621

# Optional but recommended
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
EOF
echo "====================================="
echo ""

# Test the session endpoint
echo "🧪 Testing session endpoint..."
if command -v curl &> /dev/null; then
  if [[ "$NEXTAUTH_URL" == *"https://"* ]]; then
    echo "Testing: ${NEXTAUTH_URL}/api/auth/session"
    curl -s "${NEXTAUTH_URL}/api/auth/session" | head -c 100
    echo "..."
  else
    echo "Testing: http://localhost:3001/api/auth/session"
    curl -s "http://localhost:3001/api/auth/session" | head -c 100
    echo "..."
  fi
else
  echo "curl not found, skipping test"
fi

echo ""
echo "✅ Check complete!"
echo ""
echo "To fix authentication issues:"
echo "1. Set all required environment variables"
echo "2. Restart the application"
echo "3. Clear browser cookies for the domain"
echo "4. Try logging in again"