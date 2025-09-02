# Fix Clerk Authentication for Local Development

## The Problem
You're getting "Invalid host" error because you're using **production** Clerk keys (`pk_live_`) in **local development** at `localhost:3000`.

## Solution Options

### Option 1: Get Development Keys (Recommended)
1. Go to https://dashboard.clerk.com/
2. In the top dropdown, switch to "Development" environment
3. If you don't have a development instance, create one:
   - Click "Create development instance"
   - Name it "SteppersLife Dev"
4. Go to "API Keys" in the sidebar
5. Copy the development keys (they start with `pk_test_` and `sk_test_`)
6. Update `.env.local`:

```env
# Replace these with your actual development keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_DEV_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_DEV_SECRET_HERE
```

### Option 2: Add localhost to Production Instance
1. Go to https://dashboard.clerk.com/
2. Stay in "Production" environment
3. Go to "Domains" in the sidebar
4. Click "Add domain"
5. Add: `localhost:3000`
6. Save changes

Then your current production keys will work locally.

### Option 3: Bypass Authentication for Development
Create a `.env.local` with minimal auth:

```env
# Disable Clerk for local development
NEXT_PUBLIC_DISABLE_AUTH=true
```

Then update `middleware.ts` to check this:

```typescript
if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
  return NextResponse.next();
}
```

## Quick Test
After fixing, restart the dev server:

```bash
npm run dev
```

Visit http://localhost:3000 - you should not see the Clerk error anymore.

## Current Configuration
Your `.env.local` currently has:
- **Production keys**: `pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ`
- **Problem**: Production instance doesn't recognize `localhost:3000`

## Recommended Setup
Use separate environments:
- **Development**: localhost with `pk_test_` keys
- **Production**: stepperslife.com with `pk_live_` keys

This keeps development and production data separate and avoids auth issues.