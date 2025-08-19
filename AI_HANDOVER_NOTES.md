# AI HANDOVER NOTES - CRITICAL INFORMATION

## Current Situation
**Date:** January 19, 2025
**Project:** SteppersLife Event Ticketing Platform
**URL:** https://stepperslife.com
**Status:** Site is STUCK showing old cached version from 8/19/2025 with green test banner

## THE MAIN PROBLEM
The live site is serving a heavily cached version from months ago. Despite correct code in GitHub, the site shows:
- ❌ Green "DEPLOYMENT TEST" banner from 8/19/2025 4:16 PM
- ❌ Old EventList component instead of new EventsDisplay
- ❌ Missing /version and /version.txt endpoints
- ❌ Cached with `Cache-Control: s-maxage=31536000` (1 year!)

## What Has Been Done
1. ✅ Removed all test banners from code
2. ✅ Implemented EventsDisplay component with 4 view modes (Grid, Masonry, List, Map)
3. ✅ Set up payment system (Square, PayPal, Cash App - NO Stripe)
4. ✅ Added Google Maps integration
5. ✅ Fixed GitHub webhook (URL: http://72.60.28.175:8000/webhooks/source/github/events/manual)
6. ✅ Added cache-busting headers to next.config.ts
7. ✅ Set pages to force-dynamic rendering

## What Still Needs To Be Done

### IMMEDIATE PRIORITY - Fix Deployment
1. **Clear server-side cache**
   - SSH into Coolify server (72.60.28.175)
   - Delete `.next/cache` directory
   - Clear nginx cache if present
   - Force rebuild without cache

2. **Verify Coolify deployment**
   - Check Coolify is deploying from this repo
   - Ensure build completes successfully
   - Verify nginx serves fresh build

### Setup Required
1. **Environment Variables**
   - Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
   - Add Google OAuth credentials (create at console.cloud.google.com)
   - Add Square API keys from Square dashboard
   - Add PayPal credentials

2. **Convex Database**
   - Deploy Convex functions: `npx convex dev` then `npx convex deploy`
   - Set CONVEX_DEPLOY_KEY from Convex dashboard

3. **Test Payment Systems**
   - Square checkout flow
   - PayPal integration
   - Cash App display
   - Zelle payouts for organizers

## Project Structure
```
IRA/
├── app/                 # Next.js app directory
│   ├── page.tsx        # Homepage (NO test banner here!)
│   ├── api/            # API routes
│   └── ...
├── components/         # React components
│   ├── EventsDisplay.tsx  # Main event display (4 modes)
│   ├── PaymentMethodSelector.tsx
│   └── ...
├── convex/            # Convex backend
│   ├── events.ts      # Event functions
│   └── schema.ts      # Database schema
├── lib/               # Utilities
├── public/            # Static assets
└── hooks/             # React hooks
```

## Technologies Used
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Convex (real-time database)
- **Auth:** Auth.js (NextAuth) with Google OAuth
- **Payments:** Square, PayPal, Cash App (NO STRIPE!)
- **Maps:** Google Maps API
- **Deployment:** Coolify (self-hosted PaaS)

## Common Commands
```bash
# Development
npm install
npm run dev

# Build
npm run build
npm start

# Deploy Convex
npx convex dev  # Development
npx convex deploy  # Production

# Clear cache (on server)
rm -rf .next/cache
pm2 restart all
```

## CRITICAL WARNINGS
1. **DO NOT** add Stripe - client specifically wants Square/PayPal/Cash App only
2. **DO NOT** add any test banners or debug messages to production
3. **DO NOT** use static generation - use force-dynamic for all pages
4. **ALWAYS** work from this single folder, not multiple locations
5. **Cache is the enemy** - the site gets stuck on old versions

## Contact Points
- **Coolify Server:** 72.60.28.175
- **GitHub Repo:** https://github.com/iradwatkins/stepperslife
- **Convex Dashboard:** https://dashboard.convex.dev
- **Live Site:** https://stepperslife.com (currently showing old cached version)

## Next Steps for New AI
1. First, verify the deployment is working and cache is cleared
2. Set up environment variables properly
3. Test all payment flows
4. Ensure event creation and display works
5. Verify image uploads via Convex storage

Good luck! The code is good - it's just a deployment/caching issue.