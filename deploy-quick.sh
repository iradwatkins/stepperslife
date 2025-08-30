#!/bin/bash

echo "🚀 Quick deployment to production..."

# Deploy to server
sshpass -p "Bobby321&Gloria321Watkins?" ssh -o StrictHostKeyChecking=no root@72.60.28.175 << 'EOF'
cd /opt/stepperslife

# Update environment with correct Convex URL
cat > .env.production << 'ENVEOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[CLERK_KEY]
CLERK_SECRET_KEY=[CLERK_SECRET]
CLERK_FRONTEND_API_URL=https://clerk.stepperslife.com
CLERK_BACKEND_API_URL=https://api.clerk.com
CLERK_JWKS_URL=https://clerk.stepperslife.com/.well-known/jwks.json
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[GOOGLE_API_KEY]
DATABASE_URL=file:./dev.db
DISABLE_SQUARE=true
ENVEOF

# Pull latest code
git pull

# Rebuild
npm run build

# Restart PM2
pm2 restart stepperslife

echo "✅ Deployment complete with correct Convex URL!"
EOF