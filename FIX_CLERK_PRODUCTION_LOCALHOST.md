# Fix Clerk Production Keys for Localhost

## The Issue
You're using production Clerk keys but getting "Invalid host" error on localhost:3000.

## Solution: Add localhost to Production Clerk Instance

### Step 1: Go to Clerk Dashboard
1. Go to https://dashboard.clerk.com/
2. Make sure you're in **Production** environment (check top dropdown)
3. Sign in with your Clerk account

### Step 2: Add localhost as Allowed Domain
1. In the sidebar, go to **Domains** or **Settings → Domains**
2. Click **"Add domain"** or **"Configure"**
3. Add these domains:
   - `localhost:3000`
   - `localhost:3001` (backup)
   - `192.168.86.30:3000` (your network IP)
   - `stepperslife.com` (should already be there)
   - `www.stepperslife.com` (should already be there)

### Step 3: Update Production Settings
1. Go to **Settings → Social connections** (if using Google/social login)
2. Make sure redirect URLs include:
   - `http://localhost:3000/auth-callback`
   - `http://localhost:3000/sign-in`
   - `https://stepperslife.com/auth-callback`

### Step 4: Save and Wait
1. Save all changes
2. Wait 1-2 minutes for changes to propagate

## Alternative: Update Clerk Instance Settings

If adding domains doesn't work, you may need to update instance URLs:

1. Go to **Settings → Instance**
2. Under **URLs & Redirects**, add:
   - Home URL: `http://localhost:3000` (for development)
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/`
   - After sign-up URL: `/`

## Verify Your Current Keys

Your `.env.local` should have:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=sk_live_Zw4hG4urkym6QmEGc5DpZ2EijZebajzmWhfuYx4itq
```

These are correct production keys. The issue is that localhost isn't authorized.

## Test After Configuration

1. Restart your dev server:
```bash
npm run dev
```

2. Visit http://localhost:3000
3. The Clerk error should be gone

## If Still Having Issues

Check the Clerk instance configuration:
1. Go to https://dashboard.clerk.com/
2. Click on your app name
3. Go to **Configure → Danger zone**
4. Check if "Development instance" is enabled
5. If it says "Production instance", that's correct
6. Make sure the instance URL matches: `https://clerk.stepperslife.com` or similar

## Production Keys Work Everywhere

Once configured, your production keys will work on:
- http://localhost:3000 (local development)
- https://stepperslife.com (production)
- https://www.stepperslife.com (production www)
- Any other domains you add to the allow list