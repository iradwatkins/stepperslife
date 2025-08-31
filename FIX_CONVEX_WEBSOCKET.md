# 🔧 Fix Convex WebSocket Connection Issue

## Problem
- API endpoint works: `/api/test-convex` returns 45 events ✅
- But homepage shows "0 events found" ❌
- Console error: "Failed to connect to Convex. Events will not publish"

## Root Cause
The Convex React client cannot establish WebSocket connection through Cloudflare proxy.

## Solutions to Try

### Solution 1: Add CORS Headers to Convex Client
```typescript
// components/ConvexClientProvider.tsx
const convex = new ConvexReactClient(finalUrl, {
  unsavedChangesWarning: false,
  // Add WebSocket options
  skipConvexDeploymentUrlCheck: true,
});
```

### Solution 2: Use HTTP Long Polling Instead of WebSocket
```typescript
// Force HTTP polling mode
const convex = new ConvexReactClient(finalUrl, {
  unsavedChangesWarning: false,
  webSocketConstructor: undefined, // Disable WebSocket
});
```

### Solution 3: Direct Connection Without Proxy
Add a subdomain that bypasses Cloudflare:
1. Create `api.stepperslife.com` DNS record (grey cloud - DNS only)
2. Point it directly to server IP
3. Use for Convex connection only

### Solution 4: Enable Cloudflare WebSocket Settings
In Cloudflare Dashboard:
1. **Network** → WebSockets → ON ✅
2. **Speed** → Rocket Loader → OFF
3. **Rules** → Page Rules → Add rule for `/*`:
   - Cache Level: Bypass
   - Disable Performance

### Solution 5: Use Server-Side Data Fetching
Instead of client-side Convex subscription:
```typescript
// app/page.tsx
export default async function HomePage() {
  const events = await getEventsFromServer(); // Server-side fetch
  return <EventList events={events} />;
}
```

## Testing WebSocket Connection

Visit: https://stepperslife.com/api/debug-websocket

This page will:
1. Test if WebSocket API is available
2. Try HTTP connection to Convex
3. Attempt WebSocket connection
4. Show detailed error messages

## Quick Fix (Immediate)

Since the API works, we can use HTTP polling as a temporary fix:

```typescript
// components/ConvexClientProvider.tsx
"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const CONVEX_URL = "https://youthful-porcupine-760.convex.cloud";

// Use HTTP polling instead of WebSocket
const convex = new ConvexReactClient(CONVEX_URL, {
  unsavedChangesWarning: false,
  // Disable WebSocket to force HTTP polling
  webSocketConstructor: undefined as any,
});

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
```

## Verification Steps

1. Check WebSocket is enabled in Cloudflare
2. Test debug page: https://stepperslife.com/api/debug-websocket
3. Check browser console for connection logs
4. Verify API still works: https://stepperslife.com/api/test-convex

## Current Status
- ✅ Site loads without redirect errors
- ✅ API endpoint returns 45 events
- ❌ WebSocket connection failing
- ❌ Events not displaying on homepage