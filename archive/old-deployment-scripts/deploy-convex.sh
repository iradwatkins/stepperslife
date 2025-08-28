#!/bin/bash

echo "================================================"
echo "   Convex Database Deployment Script"
echo "================================================"
echo ""
echo "This script will help you deploy Convex database."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found!"
    echo "Creating .env.local with Google OAuth credentials..."
    cat > .env.local << 'EOF'
# Convex - Will be auto-generated
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=

# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YC4H/yZ0wC+rvmZni8BSexg4sYXQSiZMmwc6AdsC0rg=

# Google OAuth (User provided)
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]

# Square (Get these from your Square dashboard)
SQUARE_ACCESS_TOKEN=
SQUARE_LOCATION_ID=
SQUARE_APPLICATION_ID=
SQUARE_WEBHOOK_SIGNATURE_KEY=

# GitHub OAuth (Optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SteppersLife
EOF
    echo "✅ Created .env.local with Google OAuth credentials"
fi

echo ""
echo "📝 Instructions:"
echo "1. This will open Convex in your browser to login/signup"
echo "2. Create a new project or select existing one"
echo "3. The deployment URL will be saved automatically"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

echo ""
echo "🚀 Initializing Convex development environment..."
echo ""

# Run convex dev to initialize and deploy
npx convex dev

echo ""
echo "================================================"
echo "✅ Convex deployment complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Your Convex URL has been saved to .env.local"
echo "2. Run 'npm run dev' to start the application"
echo "3. Visit http://localhost:3000"
echo ""
echo "For production deployment:"
echo "1. Run 'npx convex deploy' to deploy to production"
echo "2. Update your Coolify environment with the production URL"
echo ""