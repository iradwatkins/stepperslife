# 🔐 IMPORTANT: Vault & External Services Guide

> ⚠️ **ALWAYS CHECK VAULT FIRST** - All production credentials are stored in Vault!

## 📝 Note to Self: VAULT IS THE SOURCE OF TRUTH

**Before looking for any credentials:**
1. Check Vault first: `lib/vault.ts`
2. All production keys are in Vault paths
3. Never hardcode credentials - always use Vault

## 🗄️ Vault Structure & Contents

### Current Vault Paths:
```
vault/
├── stepperslife/
│   ├── auth/           # OAuth & Auth.js credentials
│   │   ├── google_client_id
│   │   ├── google_client_secret
│   │   ├── nextauth_secret
│   │   ├── github_client_id
│   │   └── github_client_secret
│   │
│   ├── square/         # Square Payment credentials
│   │   ├── access_token
│   │   ├── application_id
│   │   ├── location_id
│   │   └── webhook_signature_key
│   │
│   ├── convex/         # Convex database
│   │   ├── url
│   │   ├── deployment
│   │   └── deploy_key
│   │
│   └── cloudflare/     # Cloudflare CDN (TO BE ADDED)
│       ├── api_token
│       ├── zone_id
│       └── account_id
```

### Access Functions Already Built:
```typescript
// These functions automatically retrieve from Vault:
getSquareCredentials()    // Returns Square API keys
getAuthCredentials()      // Returns OAuth keys
getConvexCredentials()    // Returns Convex keys
```

## 🟧 Square Payments Setup

### ✅ Already in Vault:
The Square integration is READY! Check Vault for:
- `stepperslife/square/access_token`
- `stepperslife/square/application_id`
- `stepperslife/square/location_id`
- `stepperslife/square/webhook_signature_key`

### To Enable Square Payments:
```bash
# 1. Get credentials from Vault
const squareCreds = await getSquareCredentials();

# 2. Add to Coolify environment:
SQUARE_ACCESS_TOKEN=[from vault]
SQUARE_APPLICATION_ID=[from vault]
SQUARE_LOCATION_ID=[from vault]
SQUARE_WEBHOOK_SIGNATURE_KEY=[from vault]
```

### Square Dashboard Access:
- URL: https://squareup.com/dashboard
- Sandbox: https://sandbox.squareup.com/dashboard
- Check Vault for login credentials if stored

### Square Webhook Setup:
1. In Square Dashboard → Webhooks
2. Add endpoint: `https://stepperslife.com/api/webhooks/square`
3. Subscribe to events:
   - `payment.created`
   - `payment.updated`
   - `refund.created`
   - `refund.updated`

## ☁️ Cloudflare CDN Setup

### ✅ Cloudflare Access Available:
You mentioned having Cloudflare access - credentials should be in Vault!

### Add Cloudflare Credentials to Vault:
```typescript
// Add this function to lib/vault.ts
export async function getCloudflareCredentials() {
  const secrets = await getSecret('stepperslife/cloudflare');
  return {
    apiToken: secrets.api_token,
    zoneId: secrets.zone_id,
    accountId: secrets.account_id,
  };
}

// Store Cloudflare credentials
await setSecret('stepperslife/cloudflare', {
  api_token: 'your-cf-api-token',
  zone_id: 'your-zone-id',
  account_id: 'your-account-id',
});
```

### Cloudflare Configuration for SteppersLife:

#### 1. DNS Settings:
```
Type: A
Name: @
Value: 72.60.28.175
Proxy: ✅ Enabled (Orange cloud)

Type: CNAME
Name: www
Value: stepperslife.com
Proxy: ✅ Enabled
```

#### 2. SSL/TLS Settings:
- SSL Mode: **Full (strict)**
- Always Use HTTPS: **On**
- Automatic HTTPS Rewrites: **On**
- TLS Version: **1.2 minimum**

#### 3. Caching Rules:
```
# Page Rules to Create:

1. stepperslife.com/api/*
   - Cache Level: Bypass
   - Always Online: Off

2. stepperslife.com/_next/static/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 year

3. stepperslife.com/_next/image*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   - Browser Cache TTL: 1 year

4. stepperslife.com/*
   - Cache Level: Standard
   - Browser Cache TTL: 4 hours
```

#### 4. Performance Settings:
- Auto Minify: **JavaScript, CSS, HTML**
- Brotli: **On**
- Rocket Loader: **Off** (conflicts with Next.js)
- Early Hints: **On**
- HTTP/3: **On**

#### 5. Security Settings:
- Firewall Rules: Rate limiting on `/api/*`
- Bot Fight Mode: **On**
- Challenge Passage: **30 minutes**
- Security Level: **Medium**

## 🚀 Performance Optimizations

### Image Optimization (Already Built-in):
```javascript
// Next.js already optimizes images
import Image from 'next/image';

// Cloudflare Polish will further optimize
```

### Add These Headers (in next.config.js):
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }
        ],
      },
    ]
  },
}
```

## 📊 Monitoring & Analytics

### Add to Vault:
```
stepperslife/monitoring/
├── google_analytics_id
├── sentry_dsn
├── logflare_api_key
└── uptime_robot_key
```

### Cloudflare Analytics (Free):
- Real User Monitoring
- Web Analytics
- Core Web Vitals
- Access at: Cloudflare Dashboard → Analytics

## 🔄 Auto-Update Vault Script

Create `scripts/update-vault.ts`:
```typescript
#!/usr/bin/env tsx

import { setSecret, getSecret } from '../lib/vault';

async function updateVaultSecrets() {
  console.log('🔍 CHECKING VAULT FOR ALL CREDENTIALS...');
  
  // Check each path
  const paths = [
    'stepperslife/auth',
    'stepperslife/square',
    'stepperslife/convex',
    'stepperslife/cloudflare'
  ];
  
  for (const path of paths) {
    try {
      const secrets = await getSecret(path);
      console.log(`✅ ${path}: ${Object.keys(secrets).length} keys found`);
    } catch (error) {
      console.log(`⚠️  ${path}: Not configured`);
    }
  }
}

updateVaultSecrets();
```

## 🎯 Quick Reference - Check Vault First!

### Before any deployment:
```bash
# 1. Check what's in Vault
npx tsx scripts/update-vault.ts

# 2. Get credentials from Vault
const squareCreds = await getSquareCredentials();
const authCreds = await getAuthCredentials();
const cloudfareCreds = await getCloudflareCredentials();

# 3. Never hardcode - always use Vault functions
```

## 📝 REMEMBER:

### ⚠️ VAULT FIRST RULE:
1. **ALWAYS** check Vault before looking for credentials
2. **NEVER** hardcode credentials
3. **ALL** production keys are in Vault
4. **USE** the getter functions in `lib/vault.ts`

### Current Vault Status:
- ✅ Auth credentials stored
- ✅ Square credentials stored (check for actual keys)
- ✅ Convex credentials stored
- ⏳ Cloudflare credentials (to be added)

### To Access Vault:
```bash
# Set these in your environment
export VAULT_ADDR=http://127.0.0.1:8200
export VAULT_TOKEN=[your-vault-token]

# Then use the functions
getSquareCredentials()
getAuthCredentials()
getConvexCredentials()
```

## 🚨 Security Note:

**The Vault contains:**
- Production OAuth credentials
- Payment processor keys
- Database access tokens
- CDN API keys

**Never expose Vault token or contents in:**
- Git commits
- Log files
- Error messages
- Client-side code

---

**📌 PIN THIS NOTE: Always check Vault first at `lib/vault.ts` for any credentials!**