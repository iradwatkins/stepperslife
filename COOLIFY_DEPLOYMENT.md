# Coolify Deployment Guide for SteppersLife

## ✅ Current Status

You have:
1. ✅ Coolify server configured (72.60.28.175)
2. ✅ GitHub repository: https://github.com/iradwatkins/stepperslife
3. ✅ Convex Account with Production deployment
4. ✅ Google OAuth configured
5. ⚠️ Square Developer Account (optional, add later)

## Your Production URLs:
- **Convex Deployment**: https://mild-newt-621.convex.cloud
- **Convex HTTP Actions**: https://mild-newt-621.convex.site
- **Your Website**: https://stepperslife.com

## Step 1: Get Convex Deploy Key

1. In Convex Dashboard, go to **Settings** → **Deploy Keys**
2. Click **"Generate a production deploy key"**
3. Copy the key (format: `prod:mild-newt-621_xxxxx`)

## Step 2: Deploy to Coolify

### In Coolify Dashboard:

1. **Create New Application**
   - Go to your Coolify dashboard at http://72.60.28.175:3000
   - Click "New Application"
   - Select "GitHub Repository"

2. **Connect Repository**
   - Repository: `https://github.com/iradwatkins/stepperslife`
   - Branch: `main`
   - Build Pack: `Dockerfile`

3. **Configure Environment Variables**
   Add these environment variables in Coolify:

   ```env
   # Convex Production (REQUIRED)
   NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
   CONVEX_HTTP_URL=https://mild-newt-621.convex.site
   CONVEX_DEPLOY_KEY=prod:mild-newt-621_[YOUR_KEY_HERE]

   # Auth.js (REQUIRED)
   NEXTAUTH_URL=https://stepperslife.com
   NEXTAUTH_SECRET=YC4H/yZ0wC+rvmZni8BSexg4sYXQSiZMmwc6AdsC0rg=

   # Google OAuth (REQUIRED)
   GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
   GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]

   # Application (REQUIRED)
   NEXT_PUBLIC_APP_URL=https://stepperslife.com
   NEXT_PUBLIC_APP_NAME=SteppersLife
   NODE_ENV=production

   # Square (OPTIONAL - Add when ready)
   SQUARE_ACCESS_TOKEN=
   SQUARE_APPLICATION_ID=
   SQUARE_LOCATION_ID=
   SQUARE_WEBHOOK_SIGNATURE_KEY=
   ```

4. **Configure Domain**
   - Add custom domain: `stepperslife.com`
   - Enable SSL (Let's Encrypt)
   - Set up DNS A record pointing to: `72.60.28.175`

5. **Build Configuration**
   - Build Command: `npm install --legacy-peer-deps && npx convex deploy && npm run build`
   - Start Command: `npm start`
   - Port: `3000`

6. **Deploy**
   - Click "Deploy"
   - Monitor logs for any issues

## Step 3: DNS Configuration (Cloudflare)

1. Add A record:
   - Type: A
   - Name: @ (or stepperslife.com)
   - Value: 72.60.28.175
   - TTL: Auto
   - Proxy: Off (initially)

2. Add www redirect:
   - Type: CNAME
   - Name: www
   - Value: stepperslife.com
   - TTL: Auto

## Step 4: Post-Deployment Setup

### Initialize Convex Database
```bash
npx convex deploy --prod
```

### Test Payment Flow
1. Use Square Sandbox credentials
2. Test card: 4111 1111 1111 1111
3. Any future expiry date and CVV

### Set up Square Webhooks
1. In Square Dashboard, add webhook endpoint
2. URL: `https://stepperslife.com/api/webhooks/square`
3. Events to subscribe:
   - payment.created
   - payment.updated
   - refund.created
   - refund.updated

## Step 5: Monitoring

### Check Application Health
- Application URL: https://stepperslife.com
- Coolify Dashboard: http://72.60.28.175:3000
- Check logs in Coolify for any errors

### Common Issues & Solutions

1. **Build Fails**
   - Check Node version (should be 20+)
   - Verify all environment variables are set
   - Check package-lock.json is committed

2. **Database Connection Issues**
   - Verify Convex URL is correct
   - Check Convex deployment key

3. **Payment Issues**
   - Verify Square credentials
   - Check webhook signature key
   - Ensure webhook URL is accessible

## GitHub Actions Integration

The repository includes a GitHub Actions workflow that automatically triggers Coolify deployment on push to main branch.

To set it up:
1. In Coolify, get your webhook URL and token
2. In GitHub repository settings, add secrets:
   - `COOLIFY_WEBHOOK_URL`
   - `COOLIFY_WEBHOOK_TOKEN`

## Support

For deployment issues:
- Check Coolify logs
- Verify all environment variables
- Ensure DNS is properly configured

---

**Repository**: https://github.com/iradwatkins/stepperslife
**Live Site**: https://stepperslife.com (after deployment)