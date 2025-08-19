# MANUAL DEPLOYMENT INSTRUCTIONS

## THE ISSUE
Your site is stuck showing an old version from 8/19/2025 with the green test banner.
GitHub has the correct code, but Coolify is not deploying it.

## IMMEDIATE FIX - Do this NOW:

### Option 1: Via Coolify Dashboard (if accessible)
1. Go to http://72.60.28.175:3000 (or your Coolify dashboard URL)
2. Find the SteppersLife application
3. Click on "Deployments" or "Deploy" 
4. Click "Force Deploy" or "Redeploy"
5. Check "Clear Build Cache" if available
6. Monitor the deployment logs

### Option 2: Via SSH to Server
```bash
# SSH into your server
ssh root@72.60.28.175

# Navigate to the app directory
cd /opt/stepperslife  # or wherever the app is deployed

# Pull latest code
git pull origin main

# Clear all caches
rm -rf .next
rm -rf node_modules/.cache

# Rebuild
npm install --legacy-peer-deps
npm run build

# If using PM2
pm2 restart stepperslife

# If using Docker
docker-compose down
docker system prune -a -f
docker-compose up --build -d
```

### Option 3: Fix GitHub Webhook
1. In Coolify, go to your application settings
2. Find "Webhook" or "GitHub Integration"
3. Copy the webhook URL and token
4. Go to https://github.com/iradwatkins/stepperslife/settings/secrets/actions
5. Add these secrets:
   - `COOLIFY_WEBHOOK_URL`: [paste webhook URL]
   - `COOLIFY_WEBHOOK_TOKEN`: [paste webhook token]
6. Push any commit to trigger

## VERIFICATION
After deployment, check:
1. https://stepperslife.com - Should NOT show green banner
2. Should show "Welcome to SteppersLife" with EventsDisplay component
3. https://stepperslife.com/version should return JSON

## CURRENT STATUS
- GitHub: ✅ Has correct code (no test banner)
- Production: ❌ Shows old version with green banner
- Last successful push: commit 483c9a8

Time: 2025-01-19 18:31 PST