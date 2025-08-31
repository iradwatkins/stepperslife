# 🎯 Cloudflare + Nginx Redirect Loop Fix - SOLVED

## Problem Encountered
- **Issue**: `ERR_TOO_MANY_REDIRECTS` - infinite redirect loop
- **Cause**: Nginx was forcing HTTPS redirects while Cloudflare was connecting via HTTP (Flexible mode)

## Solution Applied

### 1. Removed Problematic Nginx Config
The original nginx config had Certbot-managed redirects:
```nginx
# PROBLEM CODE - CAUSED LOOP
if ($host = stepperslife.com) {
    return 301 https://$host$request_uri;
} # managed by Certbot
```

### 2. Created Simple HTTP-Only Nginx Config
```bash
server {
    listen 80;
    listen [::]:80;
    server_name stepperslife.com www.stepperslife.com;
    
    # NO REDIRECTS - Cloudflare handles HTTPS
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }
}
```

### 3. Cloudflare Settings Required
- **DNS**: Records set to **Proxied** (orange cloud) ✅
- **SSL/TLS Mode**: **Flexible** (Cloudflare HTTPS → HTTP to origin)
- **Network**: **WebSockets** enabled

## Commands Used to Fix

```bash
# 1. Remove problematic nginx config
ssh root@72.60.28.175
rm /etc/nginx/sites-enabled/stepperslife

# 2. Create new simple config
cat > /etc/nginx/sites-enabled/stepperslife << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name stepperslife.com www.stepperslife.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
        proxy_read_timeout 86400;
    }
}
EOF

# 3. Reload nginx
systemctl reload nginx
```

## Result
- ✅ Site loads without redirect errors
- ✅ API endpoint working (45 events)
- ✅ Cloudflare proxy active (IPs: 104.21.17.192, 172.67.178.50)

## Key Learning
**Never use HTTPS redirects in nginx when using Cloudflare Flexible SSL mode**
- Cloudflare handles HTTPS for visitors
- Origin server should accept HTTP
- Let Cloudflare manage all SSL/redirects

## Infrastructure Stack
- **CDN/Proxy**: Cloudflare (WebSocket support enabled)
- **Web Server**: Nginx (HTTP only, no SSL)
- **App Server**: Node.js/Next.js (port 3000)
- **Container**: Docker
- **Auth**: Clerk
- **Database**: Convex

## Verification
```bash
# Check no redirects
curl -I https://stepperslife.com
# Should return HTTP 200, not 301

# Test API
curl https://stepperslife.com/api/test-convex
# Should return events

# Check Cloudflare active
dig stepperslife.com
# Should return Cloudflare IPs (104.x.x.x or 172.x.x.x)
```