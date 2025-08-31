# 🚨 URGENT: Fix Cloudflare Redirect Loop

## Problem
Getting `ERR_TOO_MANY_REDIRECTS` because:
- Cloudflare serves HTTPS to visitors
- But connects to origin via HTTP (Flexible mode)
- Nginx redirects HTTP → HTTPS
- Creates infinite loop

## 🔧 SOLUTION 1: Change SSL Mode (Fastest Fix)

### In Cloudflare Dashboard:
1. Go to **SSL/TLS** → **Overview**
2. Change from current mode to:
   - **Flexible** = Cloudflare uses HTTP to origin (RECOMMENDED)
   - **Off** = Disable SSL completely (temporary test)

## 🔧 SOLUTION 2: Fix on Server (Alternative)

If you want to keep SSL mode as "Full":

```bash
# SSH to server
ssh root@72.60.28.175

# Edit nginx config to accept Cloudflare connections
cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name stepperslife.com www.stepperslife.com;

    # Don't redirect if coming from Cloudflare
    if ($http_cf_visitor !~ '"scheme":"https"') {
        return 301 https://$server_name$request_uri;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name stepperslife.com www.stepperslife.com;
    
    ssl_certificate /etc/letsencrypt/live/stepperslife.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stepperslife.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Reload nginx
nginx -t && systemctl reload nginx
```

## 🎯 QUICKEST FIX

**In Cloudflare Dashboard:**
1. **SSL/TLS** → **Overview** → Select **"Flexible"**
2. Wait 30 seconds
3. Clear browser cookies
4. Visit https://stepperslife.com

## 📊 How to Verify It's Fixed

```bash
# Should return 200 OK, not 301/302 redirects
curl -I https://stepperslife.com

# Should load the page content
curl -s https://stepperslife.com | grep "Welcome"
```

## 🔍 Understanding SSL Modes

- **Off**: No HTTPS at all (bad)
- **Flexible**: Visitor ↔️ Cloudflare (HTTPS) | Cloudflare ↔️ Origin (HTTP) ✅
- **Full**: Visitor ↔️ Cloudflare (HTTPS) | Cloudflare ↔️ Origin (HTTPS, any cert)
- **Full (strict)**: Same as Full but requires valid cert on origin

For our setup with nginx redirect issues, **Flexible** is the best choice.