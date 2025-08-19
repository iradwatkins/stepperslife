# Coolify Deployment Guide for SteppersLife

## Prerequisites

Before deploying to Coolify, ensure you have:

1. ✅ Coolify server configured (already done at 72.60.28.175)
2. ✅ GitHub repository: https://github.com/iradwatkins/stepperslife
3. ⚠️ Square Developer Account
4. ⚠️ Clerk Account
5. ⚠️ Convex Account

## Step 1: Create External Accounts

### Square Setup
1. Go to https://developer.squareup.com
2. Create a new application
3. Get your credentials:
   - Access Token
   - Application ID
   - Location ID
4. Set up webhook endpoint: `https://stepperslife.com/api/webhooks/square`

### Clerk Setup
1. Go to https://clerk.com
2. Create a new application
3. Get your keys:
   - Publishable Key
   - Secret Key
4. Configure OAuth providers (Google, GitHub, etc.)

### Convex Setup
1. Go to https://convex.dev
2. Create a new project
3. Get your credentials:
   - Deployment URL
   - Deploy Key

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
   # Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Square
   SQUARE_ACCESS_TOKEN=EAAAECp3J...
   SQUARE_APPLICATION_ID=sandbox-sq0idb-...
   SQUARE_LOCATION_ID=L...
   SQUARE_WEBHOOK_SIGNATURE_KEY=...
   NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-...
   NEXT_PUBLIC_SQUARE_LOCATION_ID=L...

   # Convex
   NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
   CONVEX_DEPLOYMENT=dev:...
   CONVEX_DEPLOY_KEY=...

   # App
   NEXT_PUBLIC_APP_URL=https://stepperslife.com
   NODE_ENV=production
   ```

4. **Configure Domain**
   - Add custom domain: `stepperslife.com`
   - Enable SSL (Let's Encrypt)
   - Set up DNS A record pointing to: `72.60.28.175`

5. **Build Configuration**
   - Build Command: `npm run build`
   - Install Command: `npm ci`
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