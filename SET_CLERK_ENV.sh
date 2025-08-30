#!/bin/bash

echo "Setting Clerk environment variables for production..."

# Create .env.production file on server
cat > .env.production << 'EOF'
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50
NEXTAUTH_URL=https://stepperslife.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c2V0dGxlZC1sb3VzZS00MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_pob7Rp6Cx8uGALYIZns7uJByRS0sGDLbjZFAXbhIeu
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
DATABASE_URL="file:./dev.db"

# Server Access (for reference, not used in app)
SERVER_IP=72.60.28.175
SERVER_USER=root
SERVER_PASSWORD=Bobby321&Gloria321Watkins?
EOF

echo "Environment variables set for Clerk authentication"
echo "Note: These are test keys for development. Update with production keys when ready."