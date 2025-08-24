# 🚨 URGENT: Deployment Pipeline Fix Required

## Problem Identified
- **Last Build**: 2025-08-24T03:48:46.939Z (12+ hours old)
- **Current Issue**: Coolify is NOT pulling/deploying new changes from GitHub
- **Coolify Dashboard**: Not loading at http://72.60.28.175:3000

## Manual Deployment Commands
SSH into your server and run:

```bash
# 1. Connect to server
ssh stepperslife@72.60.28.175
# Password: StepperLife2025@Secure!

# 2. Find your app container
docker ps -a

# 3. Enter the app container
docker exec -it [CONTAINER_NAME] bash

# 4. Pull latest changes
git pull origin main

# 5. Install dependencies
npm install --legacy-peer-deps

# 6. Build the app
npm run build

# 7. Exit container
exit

# 8. Restart container
docker restart [CONTAINER_NAME]
```

## Alternative: Direct Server Deployment
```bash
# If app is not in Docker
cd /home/stepperslife/stepperslife
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart all
```

## Fix Coolify
```bash
# Check Coolify status
docker ps -a | grep coolify

# Restart Coolify
docker restart coolify

# Check logs
docker logs coolify --tail 50
```

## Verify Deployment
Visit: https://stepperslife.com/theme-test
- Should see purple/teal/gold theme colors
- Theme toggle should appear in header
