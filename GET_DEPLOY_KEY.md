# 🔑 Get Your Convex Production Deploy Key

## Steps to Get Deploy Key:

1. **Go to Settings in Convex Dashboard**
   - You're already in the dashboard
   - Click on **"Settings"** in the left sidebar (gear icon)

2. **Navigate to Deploy Keys**
   - In Settings, find **"Deploy Keys"** section
   - Click **"Generate a production deploy key"**

3. **Copy the Deploy Key**
   - It will look like: `prod:mild-newt-621_xxx...xxx`
   - Copy the entire key

4. **Add to Coolify Environment**
   ```bash
   CONVEX_DEPLOY_KEY=prod:mild-newt-621_[rest_of_your_key]
   ```

## For Coolify Deployment

Add ALL these environment variables to Coolify:

```bash
# Convex Production
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOY_KEY=[YOUR_DEPLOY_KEY_HERE]

# Auth.js
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=YC4H/yZ0wC+rvmZni8BSexg4sYXQSiZMmwc6AdsC0rg=

# Google OAuth
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]

# Application
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
```

## Build Command for Coolify

Set this as your build command:
```bash
npm install --legacy-peer-deps && npx convex deploy --cmd "npm run build"
```

## Your Production URLs:

- **Production Convex**: `https://mild-newt-621.convex.cloud`
- **Development Convex**: `https://little-jellyfish-146.convex.cloud`
- **Production Site**: `https://stepperslife.com`

## Once You Have the Deploy Key:

You can deploy to production with:
```bash
CONVEX_DEPLOY_KEY=prod:mild-newt-621_xxx npx convex deploy
```

Or just push to GitHub and let Coolify handle it!