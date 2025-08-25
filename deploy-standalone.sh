#!/bin/bash

# SteppersLife Standalone Deployment Script
# Version: 3.1.0
# This script bypasses Coolify and deploys directly using Docker

set -e

echo "================================================"
echo "SteppersLife Standalone Deployment v3.1.0"
echo "Platform Fee: \$1.50 per ticket"
echo "================================================"

# Configuration
APP_NAME="stepperslife"
APP_PORT="3000"
IMAGE_NAME="stepperslife:v3.1.0"
CONTAINER_NAME="stepperslife-app"
GITHUB_REPO="https://github.com/iradwatkins/stepperslife.git"
BUILD_DIR="/tmp/stepperslife-build-$$"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Stop existing container if running
print_status "Checking for existing container..."
if docker ps -a | grep -q $CONTAINER_NAME; then
    print_warning "Stopping existing container..."
    docker stop $CONTAINER_NAME 2>/dev/null || true
    docker rm $CONTAINER_NAME 2>/dev/null || true
fi

# Clone the repository
print_status "Cloning repository from GitHub..."
rm -rf $BUILD_DIR
git clone $GITHUB_REPO $BUILD_DIR
cd $BUILD_DIR

# Check out the latest main branch
git checkout main
git pull origin main

# Create production environment file
print_status "Setting up environment variables..."
cat > .env.production << 'EOF'
# Deployment Version
NEXT_PUBLIC_BUILD_VERSION=3.1.0
NEXT_PUBLIC_BUILD_TIME=2025-08-24T21:00:00Z
NODE_ENV=production

# Convex
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621

# Auth
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Google OAuth
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}

# Square
SQUARE_ACCESS_TOKEN=${SQUARE_ACCESS_TOKEN}
SQUARE_APPLICATION_ID=${SQUARE_APPLICATION_ID}
SQUARE_LOCATION_ID=${SQUARE_LOCATION_ID}
SQUARE_WEBHOOK_SIGNATURE_KEY=${SQUARE_WEBHOOK_SIGNATURE_KEY}

# Platform Settings
PLATFORM_FEE_PER_TICKET=1.50
EOF

# Build Docker image
print_status "Building Docker image (this may take a few minutes)..."
docker build \
    --build-arg CACHE_BUST=$(date +%s) \
    --build-arg BUILD_VERSION=3.1.0 \
    --no-cache \
    -t $IMAGE_NAME \
    -f Dockerfile \
    .

# Run the container
print_status "Starting new container..."
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $APP_PORT:3000 \
    --env-file .env.production \
    -e NEXT_PUBLIC_BUILD_VERSION=3.1.0 \
    -e PLATFORM_FEE_PER_TICKET=1.50 \
    $IMAGE_NAME

# Wait for container to be healthy
print_status "Waiting for application to start..."
sleep 10

# Check if container is running
if docker ps | grep -q $CONTAINER_NAME; then
    print_status "Container is running!"
    
    # Test the application
    print_status "Testing application..."
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$APP_PORT | grep -q "200\|301\|302"; then
        print_status "Application is responding!"
        
        # Check version
        VERSION_CHECK=$(curl -s http://localhost:$APP_PORT/version | grep -o '"version":"[^"]*"' | cut -d'"' -f4)
        if [ "$VERSION_CHECK" = "3.1.0" ]; then
            print_status "Version 3.1.0 confirmed!"
        else
            print_warning "Version mismatch. Expected 3.1.0, got $VERSION_CHECK"
        fi
    else
        print_error "Application is not responding on port $APP_PORT"
    fi
    
    # Show container logs
    print_status "Recent logs:"
    docker logs --tail 20 $CONTAINER_NAME
    
    echo ""
    echo "================================================"
    echo -e "${GREEN}Deployment Complete!${NC}"
    echo "================================================"
    echo "Application URL: http://localhost:$APP_PORT"
    echo "Version endpoint: http://localhost:$APP_PORT/version"
    echo "Container name: $CONTAINER_NAME"
    echo "Image: $IMAGE_NAME"
    echo ""
    echo "To view logs: docker logs -f $CONTAINER_NAME"
    echo "To stop: docker stop $CONTAINER_NAME"
    echo "To restart: docker restart $CONTAINER_NAME"
    echo "================================================"
else
    print_error "Container failed to start!"
    echo "Checking logs..."
    docker logs $CONTAINER_NAME
    exit 1
fi

# Cleanup build directory
rm -rf $BUILD_DIR

print_status "Deployment script completed successfully!"