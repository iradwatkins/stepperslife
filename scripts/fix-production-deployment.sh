#!/bin/bash

echo "🔧 Fixing production deployment configuration..."

# SSH to server and update configuration
ssh root@72.60.28.175 << 'EOF'
cd /opt/stepperslife

echo "📝 Updating environment configuration..."
cat > .env.production << 'ENVEOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50

# Clerk Authentication (Production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq
CLERK_FRONTEND_API_URL=https://clerk.stepperslife.com
CLERK_BACKEND_API_URL=https://api.clerk.com
CLERK_JWKS_URL=https://clerk.stepperslife.com/.well-known/jwks.json

# Convex PRODUCTION (Fixed!)
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760

# App Configuration
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE

# Database
DATABASE_URL="file:./dev.db"

# Disable Square for now
DISABLE_SQUARE=true
ENVEOF

echo "🔄 Pulling latest code..."
git pull

echo "🔨 Rebuilding application with correct environment..."
npm run build

echo "🚀 Restarting PM2 with updated environment..."
pm2 restart stepperslife --update-env

echo "✅ Production deployment fixed!"
echo "🌐 Check https://stepperslife.com - events should now be visible"
EOF

echo "✅ Deployment script completed!"