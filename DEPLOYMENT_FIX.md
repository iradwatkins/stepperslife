# URGENT: Deployment Fix Required

## THE PROBLEM
Your site stepperslife.com is stuck showing an old version from 8/19/2025 because the GitHub → Coolify deployment pipeline is broken.

## ROOT CAUSE
The GitHub Actions workflow is failing because these secrets are missing:
- `COOLIFY_WEBHOOK_URL` 
- `COOLIFY_WEBHOOK_TOKEN`

## HOW TO FIX

### Option 1: Fix GitHub Secrets (Recommended)
1. Log into Coolify at http://72.60.28.175:3000
2. Go to your SteppersLife application settings
3. Find the Webhook section
4. Copy the webhook URL and token
5. Go to https://github.com/iradwatkins/stepperslife/settings/secrets/actions
6. Add new repository secrets:
   - Name: `COOLIFY_WEBHOOK_URL`, Value: [paste webhook URL from Coolify]
   - Name: `COOLIFY_WEBHOOK_TOKEN`, Value: [paste webhook token from Coolify]
7. Re-run the failed GitHub Action or push a new commit

### Option 2: Manual Deployment in Coolify
1. Log into Coolify at http://72.60.28.175:3000
2. Go to your SteppersLife application
3. Click "Deploy" or "Redeploy" button
4. Clear any build cache options if available
5. Monitor the deployment logs

### Option 3: Direct Server Access (If you have SSH)
```bash
ssh root@72.60.28.175
cd /path/to/stepperslife
docker-compose down
docker system prune -a
git pull origin main
docker-compose up --build -d
```

## WHAT SHOULD BE DEPLOYED
- **Current on GitHub:** Version 2.0.0 with NO test banners
- **Stuck on production:** Old version with green "DEPLOYMENT TEST" banner
- **Expected result:** Clean homepage with EventsDisplay component

## Verification
After deployment, check:
1. https://stepperslife.com should NOT show green banner
2. https://stepperslife.com/version should return JSON
3. https://stepperslife.com/version.txt should return version info

Time: 2025-01-19 18:26 PST