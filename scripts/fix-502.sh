#!/bin/bash

# =============================================================================
# SteppersLife 502 Error Quick Fix Script
# =============================================================================
# This script provides an instant fix for 502 Bad Gateway errors by triggering
# a fresh deployment through GitHub Actions. The deployment will rebuild the
# Docker container, restart PM2, and restore service within 2-3 minutes.
#
# Usage: ./scripts/fix-502.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  SteppersLife 502 Error Quick Fix${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Not in a git repository${NC}"
    echo "Please run this script from the SteppersLife project root"
    exit 1
fi

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Warning: You're on branch '$CURRENT_BRANCH', not 'main'${NC}"
    echo -e "Do you want to switch to main branch? (y/n)"
    read -r SWITCH_BRANCH
    if [ "$SWITCH_BRANCH" = "y" ] || [ "$SWITCH_BRANCH" = "Y" ]; then
        git checkout main
        git pull origin main
    else
        echo -e "${YELLOW}Continuing on branch '$CURRENT_BRANCH'...${NC}"
    fi
fi

# Generate timestamp for commit message
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_MSG="fix: Trigger deployment to resolve 502 error - $TIMESTAMP"

echo -e "${YELLOW}🔧 Creating recovery commit...${NC}"
git commit --allow-empty -m "$COMMIT_MSG"

echo -e "${YELLOW}🚀 Pushing to trigger deployment...${NC}"
git push origin main

echo ""
echo -e "${GREEN}✅ Deployment triggered successfully!${NC}"
echo ""
echo -e "${BLUE}What happens next:${NC}"
echo "1. GitHub Actions will start the deployment workflow"
echo "2. E2E tests will run to verify site health"
echo "3. Docker container will be rebuilt and deployed"
echo "4. PM2 will manage the application with auto-restart"
echo "5. Site should be available in 2-3 minutes"
echo ""
echo -e "${BLUE}Monitor deployment progress:${NC}"
echo "• GitHub Actions: https://github.com/iradwatkins/stepperslife/actions"
echo "• Live site: https://stepperslife.com"
echo "• Health check: https://stepperslife.com/api/health"
echo ""
echo -e "${GREEN}🎉 Recovery initiated! The site will be back online shortly.${NC}"