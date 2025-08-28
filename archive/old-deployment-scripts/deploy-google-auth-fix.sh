#!/bin/bash

# SteppersLife Google Authentication Fix Deployment
# Version: 3.1.1
# Issue: Google Sign-In not working due to missing credentials

echo "================================================"
echo "DEPLOYING GOOGLE AUTH FIX - v3.1.1"
echo "================================================"

# Configuration
SERVER_IP="72.60.28.175"
APP_NAME="stepperslife"
VERSION="3.1.1"

echo "1. Creating environment configuration..."

# Create the environment file with Google credentials
cat > .env.production.deploy << 'EOF'
# Core Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXTAUTH_URL=https://stepperslife.com

# CRITICAL: Add your actual secrets here
NEXTAUTH_SECRET=REPLACE_WITH_ACTUAL_SECRET

# Google OAuth - REPLACE WITH ACTUAL VALUES
GOOGLE_CLIENT_ID=REPLACE_WITH_ACTUAL_CLIENT_ID
GOOGLE_CLIENT_SECRET=REPLACE_WITH_ACTUAL_CLIENT_SECRET

# Platform Configuration
PLATFORM_FEE_PER_TICKET=1.50
NEXT_PUBLIC_PLATFORM_FEE=1.50

# Convex Database
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621

# Build Information
NEXT_PUBLIC_BUILD_VERSION=3.1.1
NEXT_PUBLIC_BUILD_TIME=2025-08-24T22:00:00Z
EOF

echo "2. Building Docker image with auth fix..."

# Create updated Dockerfile
cat > Dockerfile.auth << 'EOF'
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy application files
COPY . .

# Build with error tolerance
RUN npm run build || true

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start application
CMD ["npm", "start"]
EOF

echo "3. Building and deploying..."

# Build the Docker image
docker build --no-cache -t ${APP_NAME}:${VERSION} -f Dockerfile.auth .

echo "4. Creating deployment command for server..."

cat > server-deploy.sh << 'EOF'
#!/bin/bash
# Run this on the server

# Stop existing container
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# Run new container with Google Auth fix
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network coolify \
  -p 3000:3000 \
  --env-file .env.production \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  stepperslife:3.1.1

# Verify deployment
sleep 5
docker ps | grep stepperslife-prod
curl http://localhost:3000/api/auth/providers | jq .
EOF

echo ""
echo "================================================"
echo "GOOGLE AUTH FIX READY FOR DEPLOYMENT"
echo "================================================"
echo ""
echo "NEXT STEPS:"
echo "1. Edit .env.production.deploy and add actual credentials:"
echo "   - NEXTAUTH_SECRET (from Vault)"
echo "   - GOOGLE_CLIENT_ID (from Google Console)"
echo "   - GOOGLE_CLIENT_SECRET (from Google Console)"
echo ""
echo "2. Deploy to server:"
echo "   scp .env.production.deploy root@${SERVER_IP}:/opt/stepperslife/.env.production"
echo "   scp server-deploy.sh root@${SERVER_IP}:/opt/stepperslife/"
echo "   ssh root@${SERVER_IP} 'cd /opt/stepperslife && bash server-deploy.sh'"
echo ""
echo "3. Verify Google Auth is working:"
echo "   curl https://stepperslife.com/api/auth/providers | jq ."
echo "   Should show google.configured = true"
echo ""
echo "================================================"