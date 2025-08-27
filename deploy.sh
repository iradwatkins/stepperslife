#!/bin/bash

# SteppersLife Automatic Deployment Script
# This script pulls latest changes from GitHub and rebuilds the application

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Starting SteppersLife Deployment...${NC}"

# Navigate to project directory
cd /var/www/stepperslife-github

# Pull latest changes from GitHub
echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
git pull origin main || git pull origin master

# Check if package.json changed
if git diff HEAD@{1} --stat -- package.json | grep -q package.json; then
    echo -e "${YELLOW}📦 Package.json changed, installing dependencies...${NC}"
    npm install --legacy-peer-deps
fi

# Generate Prisma client
echo -e "${YELLOW}🔨 Generating Prisma client...${NC}"
npx prisma generate

# Run database migrations if needed
if [ -f "prisma/schema.prisma" ]; then
    echo -e "${YELLOW}🗃️ Running database migrations...${NC}"
    npx prisma migrate deploy || npx prisma db push
fi

# Build the application
echo -e "${YELLOW}🏗️ Building application...${NC}"
npm run build || echo "Build failed, will run in dev mode"

# Restart the container
echo -e "${YELLOW}🐳 Restarting Docker container...${NC}"
docker compose down
docker compose up -d --build

# Wait for container to be ready
sleep 5

# Check if container is running
if docker ps | grep -q stepperslife_app; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}🌐 Application is running at http://stepperslife.com${NC}"
    docker logs stepperslife_app --tail 10
else
    echo -e "${RED}❌ Deployment failed! Check logs:${NC}"
    docker compose logs --tail 50
    exit 1
fi

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}==================================${NC}"