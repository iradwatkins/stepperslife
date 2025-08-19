#!/bin/bash

# SteppersLife Server Update Script
# Run this on the server to pull latest changes

echo "=========================================="
echo "Updating SteppersLife on Server"
echo "=========================================="

cd /opt/stepperslife

echo "1. Pulling latest code from GitHub..."
git pull origin main

echo "2. Installing dependencies..."
npm install --legacy-peer-deps

echo "3. Building application..."
npm run build

echo "4. Restarting PM2 process..."
pm2 restart stepperslife

echo "5. Checking application status..."
pm2 status stepperslife

echo ""
echo "Update complete!"
echo "Check the app at http://72.60.28.175:3001"
echo ""
echo "View logs with: pm2 logs stepperslife"