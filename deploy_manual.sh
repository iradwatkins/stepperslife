#!/bin/bash
# Manual deployment commands for production

# Check if .env.production exists, if not create it
if [ ! -f .env.production ]; then
    echo "Creating .env.production file..."
    cat > .env.production << 'ENVEOF'
NODE_ENV=production
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GITHUB_CLIENT_ID=Ov23liJstkQqKvnMDtVz
GITHUB_CLIENT_SECRET=5c4e3c2b8e0e7a3a6b3a0b3a6b3a0b3a6b3a0b3a
SQUARE_ACCESS_TOKEN=EAAAl6Vnn8vt-OJ_Fz7-rSKJvOU9SIAUVqLLfpa1M3ufBnP-sUTBdXPmAF_4XAAo
SQUARE_LOCATION_ID=LZN634J2MSXRY
SQUARE_WEBHOOK_SIGNATURE_KEY=whsec_test_secret
SQUARE_APPLICATION_ID=sandbox-sq0idb--uxRoNAlmWg3C6w3ppztCg
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
ENVEOF
fi

# Build Docker image
echo "Building Docker image..."
docker build --no-cache -t stepperslife:latest .

# Stop and remove old container
echo "Stopping old container..."
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# Run new container
echo "Starting new container..."
docker run -d \
    --name stepperslife-prod \
    --restart unless-stopped \
    -p 3000:3000 \
    --env-file .env.production \
    stepperslife:latest

# Check if container is running
echo "Checking container status..."
docker ps | grep stepperslife-prod
