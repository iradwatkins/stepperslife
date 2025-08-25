# 🔍 Deployment Verification Checklist

## Quick Check Commands

### 1. Check Current Deployment Status
```bash
# Check version endpoint
curl https://stepperslife.com/version | jq

# Expected output should show:
# - version: "3.1.0" or higher
# - buildDate: Today's date
# - lastCommit: Recent commit hash
```

### 2. Verify Payment System
```bash
# Check if payment settings page loads
curl -s https://stepperslife.com/seller/payment-settings | grep -i "1.50"

# Should find "$1.50 per ticket" in the response
```

### 3. Check GitHub Actions
```bash
gh run list --workflow=deploy.yml --limit=5
```

---

## ⚠️ CRITICAL ISSUE FOUND (Aug 24, 2025)

### Problem
**Coolify is NOT pulling new code from GitHub**
- Stuck on January 19, 2025 build (v2.0.0)
- GitHub Actions run but don't trigger actual deployment
- Webhook appears to be broken or misconfigured

### Symptoms
1. Version endpoint shows old date
2. New features not appearing on production
3. GitHub pushes successful but changes not live
4. Build timestamp doesn't update

### Solution Required
**MANUAL INTERVENTION IN COOLIFY DASHBOARD**

1. **Access Coolify**: http://72.60.28.175:3000
2. **Navigate to**: SteppersLife application
3. **Required Actions**:
   - Clear build cache
   - Verify GitHub repo: `https://github.com/iradwatkins/stepperslife.git`
   - Check branch: `main`
   - Force rebuild
   - Check webhook configuration

---

## Verification Steps After Fix

### Step 1: Version Check
```bash
# Should return current date and v3.1.0+
curl https://stepperslife.com/version | jq '.version, .buildDate'
```

### Step 2: Feature Check
Visit these URLs and verify:
- https://stepperslife.com (Theme toggle visible when logged out)
- https://stepperslife.com/seller/payment-settings ($1.50/ticket fee shown)
- https://stepperslife.com/seller/dashboard (New dashboard layout)

### Step 3: Payment System Check
```bash
# Look for new payment providers
curl -s https://stepperslife.com/seller/payment-settings | grep -E "Square|Stripe|PayPal|Zelle"
```

---

## Coolify Configuration (MUST VERIFY)

### Repository Settings
```yaml
Source Type: GitHub
Repository: https://github.com/iradwatkins/stepperslife.git
Branch: main
Auto Deploy: Enabled
```

### Build Configuration
```yaml
Build Command: npm install --legacy-peer-deps && npm run build
Start Command: npm start
Port: 3000
Health Check Path: /version
```

### Webhook Settings
- Webhook must be enabled
- Token must match GitHub secret
- URL must be accessible

### Environment Variables
Ensure all are set in Coolify:
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
```

---

## Monitoring Commands

### Real-time Deployment Check
```bash
# Watch version endpoint for changes
while true; do 
  echo "$(date): $(curl -s https://stepperslife.com/version | jq -r '.version + " - " + .buildDate')"
  sleep 30
done
```

### Check Latest Git Commit
```bash
# Local
git log --oneline -1

# Remote
git ls-remote origin HEAD
```

### Verify Files on Server
Check these critical files exist:
- `/app/actions/createCheckoutSession.ts` (payment system)
- `/app/seller/dashboard/page.tsx` (seller dashboard)
- `/convex/transactions.ts` (transaction handling)

---

## Prevention Measures

### 1. Add Health Check
Create `/app/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA || "unknown"
  });
}
```

### 2. Add Deployment Hook
In `package.json`:
```json
"scripts": {
  "postbuild": "echo 'Build completed at:' && date"
}
```

### 3. Monitor Deployments
Set up monitoring to alert if version endpoint shows build older than 24 hours.

---

## Emergency Contacts

### Coolify Access
- URL: http://72.60.28.175:3000
- Application: SteppersLife

### GitHub Repository
- URL: https://github.com/iradwatkins/stepperslife
- Branch: main
- Actions: https://github.com/iradwatkins/stepperslife/actions

### Critical Endpoints
- Version: https://stepperslife.com/version
- Health: https://stepperslife.com/health (if implemented)
- Payment: https://stepperslife.com/seller/payment-settings

---

**URGENT**: As of Aug 24, 2025, production is running 7-month-old code.
Manual intervention required in Coolify dashboard to fix deployment pipeline.