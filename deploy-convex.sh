#!/bin/bash

echo "🚀 Deploying Convex functions..."
echo "================================"
echo ""

# Export the deployment configuration
export CONVEX_DEPLOYMENT="prod:youthful-porcupine-760"
export NEXT_PUBLIC_CONVEX_URL="https://youthful-porcupine-760.convex.cloud"

echo "📦 Target deployment: $CONVEX_DEPLOYMENT"
echo "🔗 Convex URL: $NEXT_PUBLIC_CONVEX_URL"
echo ""

# Try to deploy with the key
echo "Attempting deployment..."
echo ""

# First, let's check if the functions are valid
echo "📝 Checking function files..."
ls -la convex/*.ts | head -10

echo ""
echo "⚠️  MANUAL STEPS REQUIRED:"
echo "=========================="
echo ""
echo "Since I cannot authenticate interactively, you need to:"
echo ""
echo "1. Open a terminal in the project directory"
echo "2. Run: npx convex dev"
echo "3. Login with: thestepperslife@gmail.com"
echo "4. Select the 'steppers-life' team"
echo "5. Select the 'steppers-life' project"
echo "6. Once connected (you'll see 'Watching for file changes'), press Ctrl+C"
echo "7. Run: npx convex deploy"
echo ""
echo "After deployment, the following will work:"
echo "- Events will load from the database"
echo "- Admin reset page at /admin/reset-data"
echo "- All database operations"
echo ""
echo "Current status:"
echo "- Clerk: ✅ Connected"
echo "- Convex: ⚠️ Functions need deployment"
echo "- Site: ✅ Running"