#!/bin/bash

echo "🚨 EMERGENCY PRODUCTION FIX"
echo "============================"

SERVER_IP="72.60.28.175"
SERVER_USER="root"
SERVER_PASSWORD="Bobby321&Gloria321Watkins?"

sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP << 'REMOTE'
cd /opt/stepperslife

# Pull latest
git pull origin main

# Install Square
npm install square --save --legacy-peer-deps

# Quick rebuild
npm run build

# Use node directly to avoid docker issues
pkill -f "node server.js" 2>/dev/null || true

# Start with node directly
nohup node .next/standalone/server.js > /var/log/stepperslife.log 2>&1 &

sleep 5
ps aux | grep -v grep | grep "node.*server.js"
curl -I http://localhost:3000
REMOTE
