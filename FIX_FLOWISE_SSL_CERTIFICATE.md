# Fix SSL Certificate Error for flowise.agistaffers.com

## Quick Fix Commands (Run on Server)

```bash
# SSH to your server first
ssh root@[YOUR_SERVER_IP]

# 1. Install/Renew SSL Certificate with Certbot
certbot certonly --nginx -d flowise.agistaffers.com \
  --non-interactive \
  --agree-tos \
  --email admin@agistaffers.com \
  --force-renewal

# Or if using standalone mode
certbot certonly --standalone -d flowise.agistaffers.com \
  --non-interactive \
  --agree-tos \
  --email admin@agistaffers.com \
  --pre-hook "docker stop flowise" \
  --post-hook "docker start flowise"
```

## Method 1: Fix with Traefik (Recommended)

If using Traefik as reverse proxy:

```bash
# Deploy Flowise with automatic SSL
docker run -d \
  --name flowise \
  --restart unless-stopped \
  --network web \
  -e FLOWISE_USERNAME=admin \
  -e FLOWISE_PASSWORD=your-secure-password \
  -v flowise_data:/root/.flowise \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.flowise.rule=Host(\`flowise.agistaffers.com\`)" \
  --label "traefik.http.services.flowise.loadbalancer.server.port=3000" \
  --label "traefik.http.routers.flowise.tls=true" \
  --label "traefik.http.routers.flowise.tls.certresolver=letsencrypt" \
  --label "traefik.http.routers.flowise.entrypoints=websecure" \
  --label "traefik.http.middlewares.flowise-redirect.redirectscheme.scheme=https" \
  --label "traefik.http.routers.flowise-http.rule=Host(\`flowise.agistaffers.com\`)" \
  --label "traefik.http.routers.flowise-http.entrypoints=web" \
  --label "traefik.http.routers.flowise-http.middlewares=flowise-redirect" \
  flowiseai/flowise
```

## Method 2: Fix with Nginx

```bash
# 1. First get SSL certificate
certbot certonly --nginx -d flowise.agistaffers.com

# 2. Create Nginx config
cat > /etc/nginx/sites-available/flowise.conf << 'EOF'
server {
    listen 80;
    server_name flowise.agistaffers.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name flowise.agistaffers.com;
    
    ssl_certificate /etc/letsencrypt/live/flowise.agistaffers.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flowise.agistaffers.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
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

# 3. Enable site and restart
ln -s /etc/nginx/sites-available/flowise.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# 4. Run Flowise container
docker run -d \
  --name flowise \
  --restart unless-stopped \
  -p 3000:3000 \
  -v flowise_data:/root/.flowise \
  -e FLOWISE_USERNAME=admin \
  -e FLOWISE_PASSWORD=your-secure-password \
  flowiseai/flowise
```

## Method 3: Quick Deploy Script

Create `deploy-flowise-ssl.sh`:

```bash
#!/bin/bash

DOMAIN="flowise.agistaffers.com"
EMAIL="admin@agistaffers.com"
NETWORK="web"  # or dokploy-network

echo "🔐 Setting up SSL for $DOMAIN..."

# Stop existing container
docker stop flowise 2>/dev/null || true
docker rm flowise 2>/dev/null || true

# Get SSL certificate
echo "📜 Obtaining SSL certificate..."
certbot certonly --standalone -d $DOMAIN \
  --non-interactive \
  --agree-tos \
  --email $EMAIL \
  --force-renewal || {
    echo "❌ Failed to obtain certificate"
    exit 1
}

# Deploy with SSL
echo "🚀 Deploying Flowise with SSL..."
docker run -d \
  --name flowise \
  --restart unless-stopped \
  --network $NETWORK \
  -e FLOWISE_USERNAME=admin \
  -e FLOWISE_PASSWORD=secure-password-here \
  -e FLOWISE_SECRETKEY_OVERWRITE=your-secret-key \
  -v flowise_data:/root/.flowise \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.flowise.rule=Host(\`$DOMAIN\`)" \
  --label "traefik.http.services.flowise.loadbalancer.server.port=3000" \
  --label "traefik.http.routers.flowise.tls=true" \
  --label "traefik.http.routers.flowise.tls.certresolver=letsencrypt" \
  --label "traefik.http.routers.flowise.entrypoints=websecure" \
  flowiseai/flowise

sleep 5

# Verify
if docker ps | grep -q flowise; then
    echo "✅ Flowise container running"
    echo "🔒 SSL certificate installed"
    echo "🌐 Visit: https://$DOMAIN"
    echo ""
    echo "Default credentials:"
    echo "Username: admin"
    echo "Password: secure-password-here"
else
    echo "❌ Deployment failed"
    docker logs flowise
fi
```

## Troubleshooting

### 1. Check Current Certificate Status
```bash
# Check if certificate exists
certbot certificates | grep flowise

# Check certificate expiry
echo | openssl s_client -servername flowise.agistaffers.com -connect flowise.agistaffers.com:443 2>/dev/null | openssl x509 -noout -dates
```

### 2. Force Certificate Renewal
```bash
# Stop services using port 80
docker stop $(docker ps -q)

# Force renewal
certbot renew --force-renewal --cert-name flowise.agistaffers.com

# Restart services
docker start flowise
```

### 3. Check DNS
```bash
# Verify DNS points to your server
dig flowise.agistaffers.com
nslookup flowise.agistaffers.com
```

### 4. Test SSL Configuration
```bash
# Test SSL
curl -I https://flowise.agistaffers.com

# Test with verbose output
curl -vI https://flowise.agistaffers.com
```

### 5. View Logs
```bash
# Flowise logs
docker logs flowise

# Traefik logs (if using)
docker logs traefik

# Nginx logs (if using)
tail -f /var/log/nginx/error.log
```

## Alternative: Cloudflare SSL (Quick Fix)

If you're using Cloudflare:

1. **In Cloudflare Dashboard:**
   - Go to SSL/TLS settings
   - Set SSL mode to "Full" or "Flexible"
   - Enable "Always Use HTTPS"

2. **On Server:**
   ```bash
   # Can use self-signed certificate with Cloudflare
   docker run -d \
     --name flowise \
     --restart unless-stopped \
     -p 3000:3000 \
     -v flowise_data:/root/.flowise \
     flowiseai/flowise
   ```

## Common Issues and Solutions

### Issue: "Connection refused"
```bash
# Check if Flowise is running
docker ps | grep flowise

# Check ports
netstat -tlnp | grep 3000
```

### Issue: "Certificate not trusted"
```bash
# Ensure using Let's Encrypt production certificates
certbot certificates
```

### Issue: Mixed content warnings
Add to Flowise environment:
```bash
-e FLOWISE_PROTOCOL=https \
-e FLOWISE_HOST=flowise.agistaffers.com
```

## Complete Deployment Example

```bash
#!/bin/bash
# Save as deploy-flowise-complete.sh

# Configuration
DOMAIN="flowise.agistaffers.com"
EMAIL="admin@agistaffers.com"
ADMIN_USER="admin"
ADMIN_PASS="change-this-password"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Setting up Flowise with SSL on $DOMAIN${NC}"

# 1. Update system
apt-get update

# 2. Install certbot if needed
which certbot || snap install certbot --classic

# 3. Stop existing
docker stop flowise 2>/dev/null || true
docker rm flowise 2>/dev/null || true

# 4. Get certificate
certbot certonly --standalone -d $DOMAIN \
  --non-interactive \
  --agree-tos \
  --email $EMAIL

# 5. Deploy
docker run -d \
  --name flowise \
  --restart unless-stopped \
  --network bridge \
  -p 3000:3000 \
  -e FLOWISE_USERNAME=$ADMIN_USER \
  -e FLOWISE_PASSWORD=$ADMIN_PASS \
  -e DATABASE_PATH=/root/.flowise \
  -e APIKEY_PATH=/root/.flowise \
  -e SECRETKEY_PATH=/root/.flowise \
  -e LOG_PATH=/root/.flowise/logs \
  -v flowise_data:/root/.flowise \
  flowiseai/flowise

# 6. Setup reverse proxy with SSL
# (Add Nginx or Traefik configuration here based on your setup)

echo -e "${GREEN}Deployment complete!${NC}"
echo "Access at: https://$DOMAIN"
echo "Username: $ADMIN_USER"
echo "Password: $ADMIN_PASS"
```

Run with:
```bash
chmod +x deploy-flowise-complete.sh
./deploy-flowise-complete.sh
```