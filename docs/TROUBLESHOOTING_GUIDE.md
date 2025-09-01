# SteppersLife Troubleshooting Guide

## Document Version: 2025-09-01
**Last Updated**: September 1, 2025  
**Purpose**: Comprehensive documentation of all problems encountered and their solutions

---

## Table of Contents
1. [502 Bad Gateway Errors](#502-bad-gateway-errors)
2. [Events Not Showing in My Events](#events-not-showing-in-my-events)
3. [Authentication Issues](#authentication-issues)
4. [Deployment Issues](#deployment-issues)
5. [Database & Convex Issues](#database--convex-issues)
6. [Debug Tools & Utilities](#debug-tools--utilities)

---

## 502 Bad Gateway Errors

### Problem Description
- Site shows "Bad gateway Error code 502" via Cloudflare
- Application is running but not accessible through domain

### Root Causes
1. Docker container crashed/stopped
2. Reverse proxy (Nginx/Traefik) misconfiguration
3. Network connectivity issues between Cloudflare and server

### Solutions Applied

#### Solution 1: Container Restart
```bash
# Check if container is running
docker ps | grep -i steppers

# If not running, restart it
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true
docker run -d --name stepperslife-prod --restart unless-stopped \
  -p 3000:3000 --env-file .env.production stepperslife:latest
```

#### Solution 2: GitHub Actions Deployment
- Push any commit to trigger automatic deployment
- GitHub Actions workflow handles container restart
- Located at `.github/workflows/deploy-production.yml`

#### Solution 3: Direct Access Workaround
- When proxy fails, access directly: http://72.60.28.175:3000
- Useful for debugging when Cloudflare proxy is down

### Verification Commands
```bash
# Check if app is running
curl -s http://72.60.28.175:3000/api/health

# Check Cloudflare proxy
curl -I https://stepperslife.com

# Should return HTTP/2 200, not 502
```

### Prevention
- Container has `--restart unless-stopped` policy
- GitHub Actions auto-deploys on push to main
- Health check endpoint at `/api/health`

---

## Events Not Showing in My Events

### Problem Description
- User creates event but it doesn't appear in "My Events" section
- Events exist in database but not displaying for logged-in user
- Affects both `/organizer/events` and `/seller/events` pages

### Root Causes
1. **Static Page Issue**: `/organizer/events` was showing static "No events yet" instead of querying database
2. **Client-Side Timing**: userId not loaded when component queries database
3. **userId Mismatch**: Server-side and client-side userId formats might differ

### Solutions Applied

#### Solution 1: Fixed Static Page
**File**: `/app/organizer/events/page.tsx`
```typescript
// OLD (BROKEN):
export default function OrganizerEvents() {
  return (
    <div className="text-center py-12">
      <p>No events yet</p>  // Static message
    </div>
  );
}

// NEW (FIXED):
"use client";
import SellerEventList from "@/components/SellerEventList";

export default function OrganizerEvents() {
  return (
    <div>
      <SellerEventList />  // Actually queries database
    </div>
  );
}
```

#### Solution 2: Enhanced SellerEventList Component
**File**: `/components/SellerEventList.tsx`
```typescript
// Added loading states and debug logging
const { user, isSignedIn, isLoaded } = useAuth();

// Skip query if user not loaded
const events = useQuery(
  api.events.getSellerEvents,
  isLoaded && isSignedIn && user?.id ? { userId: user.id } : "skip"
);

// Added manual refresh button
const handleRefresh = () => {
  setRetryCount(prev => prev + 1);
};
```

#### Solution 3: Debug Mode
Enable debug mode to see what's happening:
```javascript
// In browser console:
localStorage.setItem('debug_events', 'true')
```

This shows:
- Current userId
- Number of events found
- Query status
- Refresh button

### Debug Tools Created
1. **Debug Page**: `/app/debug/events/page.tsx`
   - Shows all events in database
   - Highlights which events match current user
   - Search functionality
   - Shows userId comparison

2. **Debug Queries**: Added to `/convex/events.ts`
   - `debugGetAllEventsWithUsers` - Shows all events with userIds
   - `debugFindEventByName` - Search events by name

### Verification
Visit https://stepperslife.com/debug/events to:
- See your current userId
- View all events in database
- Check which events match your userId
- Search for specific events

---

## Authentication Issues

### Problem Description
- Clerk authentication not syncing with Convex database
- User signed in but events not showing
- Environment variables missing in production

### Root Causes
1. Missing environment variables in Docker container
2. Clerk userId not syncing to Convex
3. Race condition between auth loading and database queries

### Solutions Applied

#### Solution 1: Environment Variables
**File**: `.env.production`
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_Y2xlcmsuc3RlcHBlcnNsaWZlLmNvbSQ
CLERK_SECRET_KEY=[FROM_VAULT]

# Convex
NEXT_PUBLIC_CONVEX_URL=https://youthful-porcupine-760.convex.cloud
CONVEX_DEPLOYMENT=prod:youthful-porcupine-760
```

#### Solution 2: User Sync Component
**File**: `/components/SyncUserWithConvex.tsx`
- Automatically syncs Clerk user to Convex on sign-in
- Added to layout for automatic execution

#### Solution 3: Auth Loading States
- Added `isLoaded` check before queries
- Show loading spinner while auth initializes
- Skip database queries if user not loaded

---

## Deployment Issues

### Problem Description
- SSH access lost (port 22 connection refused)
- Manual deployment not possible
- Container needs restart but can't access server

### Solutions Applied

#### Solution 1: GitHub Actions Auto-Deploy
**File**: `.github/workflows/deploy-production.yml`
- Automatically deploys on push to main
- Has server credentials stored as secrets
- Rebuilds and restarts container

#### Solution 2: Trigger Deployment
```bash
# Create a trigger file
echo "Deploy: $(date)" > DEPLOYMENT_TRIGGER.txt
git add . && git commit -m "Trigger deployment"
git push origin main
```

#### Solution 3: Emergency Scripts Created
**File**: `/EMERGENCY_RESTART.sh`
- Script to restart container when SSH returns
- Contains all necessary Docker commands
- Ready to run when access restored

### Current Infrastructure
- **Platform**: Docker on Ubuntu server
- **Proxy**: Cloudflare (no Nginx/Traefik needed)
- **Container**: `stepperslife-prod` on port 3000
- **Auto-restart**: `--restart unless-stopped` policy

---

## Database & Convex Issues

### Problem Description
- WebSocket connections fail through Cloudflare proxy
- Events not loading on homepage
- Real-time updates not working

### Root Cause
Cloudflare doesn't properly proxy WebSocket connections for Convex

### Solution: Server-Side Rendering
**File**: `/app/page.tsx`
```typescript
// OLD (BROKEN - Client-side):
"use client";
import { useQuery } from "convex/react";
const events = useQuery(api.events.get) || []; // WebSocket fails

// NEW (WORKING - Server-side):
import { fetchQuery } from "convex/nextjs";
export const dynamic = 'force-dynamic';
export const revalidate = 30;

export default async function Home() {
  const events = await fetchQuery(api.events.get) || [];
  // Server-side fetch works perfectly
}
```

### Important Rules
1. **NEVER** change homepage back to client-side rendering
2. **ALWAYS** use `fetchQuery` for initial data load
3. **WebSocket** only for updates after initial load

---

## Debug Tools & Utilities

### 1. Health Check Endpoint
**URL**: `/api/health`
```json
{
  "status": "healthy",
  "version": "3.2.0",
  "checks": {
    "app": "healthy",
    "auth": "configured",
    "environment": {...}
  }
}
```

### 2. Debug Events Page
**URL**: `/debug/events`
- Shows current user info
- Lists all events with userId comparison
- Search functionality
- Enable/disable debug mode

### 3. Browser Console Commands
```javascript
// Enable debug mode
localStorage.setItem('debug_events', 'true')

// Disable debug mode
localStorage.removeItem('debug_events')

// Check current user in console
console.log(window.__clerk_user_id)
```

### 4. Verification Commands
```bash
# Check events count
curl -s https://stepperslife.com/api/test-convex | jq '.data.eventCount'

# Check health
curl -s https://stepperslife.com/api/health

# Check if homepage has events
curl -s https://stepperslife.com | grep -c "event-card"
```

---

## Quick Reference

### Common Issues & Fast Fixes

| Issue | Quick Fix |
|-------|-----------|
| 502 Error | Push commit to trigger GitHub Actions |
| Events not showing | Enable debug mode, check userId match |
| Can't create event | Check auth, refresh page |
| SSH not working | Use GitHub Actions for deployment |
| WebSocket errors | Use server-side rendering |

### Important Files
- `/components/SellerEventList.tsx` - Event listing component
- `/app/organizer/events/page.tsx` - My Events page
- `/app/debug/events/page.tsx` - Debug dashboard
- `/convex/events.ts` - Database queries
- `/.github/workflows/deploy-production.yml` - Auto-deployment

### Server Details
- **IP**: 72.60.28.175
- **Port**: 3000
- **Container**: stepperslife-prod
- **Domain**: stepperslife.com

---

## Lessons Learned

1. **Don't Rebuild Everything**: Most issues are small configuration problems
2. **Check What's Working First**: Often the app is running, just proxy issues
3. **Use Existing Tools**: GitHub Actions can deploy when SSH fails
4. **Server-Side Rendering**: Solves WebSocket proxy issues with Cloudflare
5. **Debug Tools Are Essential**: Create them before you need them
6. **Document Everything**: This guide will save hours next time

---

*Last updated: September 1, 2025 by Claude Code*