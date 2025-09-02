#!/bin/bash

echo "🔐 Clerk Authentication Mode Switcher"
echo "====================================="
echo ""
echo "Choose an option:"
echo "1) Development mode (bypass auth for localhost)"
echo "2) Production mode (require auth)"
echo "3) Use development Clerk keys"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "Switching to development mode..."
    cp middleware.development.ts middleware.ts
    echo "NEXT_PUBLIC_BYPASS_AUTH=true" >> .env.local
    echo "✅ Development mode enabled - auth bypassed for localhost"
    echo "Restart your dev server: npm run dev"
    ;;
  2)
    echo "Switching to production mode..."
    git checkout middleware.ts
    sed -i '' '/NEXT_PUBLIC_BYPASS_AUTH/d' .env.local 2>/dev/null || true
    echo "✅ Production mode enabled - auth required"
    echo "Restart your dev server: npm run dev"
    ;;
  3)
    echo ""
    echo "To use development keys:"
    echo "1. Go to https://dashboard.clerk.com/"
    echo "2. Switch to 'Development' environment"
    echo "3. Copy the keys from API Keys section"
    echo "4. Update .env.local with:"
    echo ""
    echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY"
    echo "CLERK_SECRET_KEY=sk_test_YOUR_SECRET"
    echo ""
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac