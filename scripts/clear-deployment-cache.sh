#!/bin/bash
# Clear Coolify deployment cache
# Version 3.1.0 - Platform fee: $1.50 per ticket

echo "================================================"
echo "CLEARING DEPLOYMENT CACHE - VERSION 3.1.0"
echo "================================================"
echo "Build Time: $(date)"
echo "Platform Fee: $1.50 per ticket"
echo ""

# Remove any existing build artifacts
rm -rf .next/
rm -rf node_modules/
rm -rf .cache/

# Clear Docker build cache if available
if command -v docker &> /dev/null; then
    echo "Clearing Docker build cache..."
    docker builder prune -af 2>/dev/null || true
fi

# Force npm cache clean
npm cache clean --force 2>/dev/null || true

echo ""
echo "Cache cleared successfully!"
echo "Ready for fresh deployment of version 3.1.0"
echo "================================================"