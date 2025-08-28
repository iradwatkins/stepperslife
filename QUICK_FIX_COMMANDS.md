# Quick Fix Commands for Ollama and Flowise

## Copy and paste these commands on your server:

### 1. SSH to your server
```bash
ssh root@[YOUR_SERVER_IP]
```

### 2. Fix Both Sites (One Command)
```bash
# Fix Ollama
docker stop ollama 2>/dev/null; docker rm ollama 2>/dev/null
docker run -d --name ollama --restart unless-stopped --network bridge -p 11434:11434 -v ollama:/root/.ollama ollama/ollama
docker exec ollama ollama pull llama2:7b &

# Fix Flowise  
docker stop flowise 2>/dev/null; docker rm flowise 2>/dev/null
docker run -d --name flowise --restart unless-stopped --network bridge -p 3000:3000 -e FLOWISE_USERNAME=admin -e FLOWISE_PASSWORD=admin123 -v flowise_data:/root/.flowise flowiseai/flowise

# Install SSL certificates
apt update && apt install -y certbot python3-certbot-nginx
certbot --nginx -d ollama.agistaffers.com -d flowise.agistaffers.com --non-interactive --agree-tos --email admin@agistaffers.com

# Configure Nginx
cat > /etc/nginx/sites-available/ai-apps << 'EOF'
# Ollama
server {
    server_name ollama.agistaffers.com;
    location / {
        proxy_pass http://127.0.0.1:11434;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_buffering off;
    }
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/ollama.agistaffers.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ollama.agistaffers.com/privkey.pem;
}
server {
    listen 80;
    server_name ollama.agistaffers.com;
    return 301 https://$host$request_uri;
}

# Flowise
server {
    server_name flowise.agistaffers.com;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/flowise.agistaffers.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flowise.agistaffers.com/privkey.pem;
}
server {
    listen 80;
    server_name flowise.agistaffers.com;
    return 301 https://$host$request_uri;
}
EOF

ln -sf /etc/nginx/sites-available/ai-apps /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Test
echo "Testing sites..."
curl -I https://ollama.agistaffers.com 2>/dev/null | head -1
curl -I https://flowise.agistaffers.com 2>/dev/null | head -1
```

### 3. Alternative: Using Traefik (if you have Traefik)
```bash
# Find your network
NETWORK=$(docker network ls | grep -E "web|traefik|dokploy" | awk '{print $2}' | head -1)
echo "Using network: $NETWORK"

# Deploy with Traefik labels
docker stop ollama flowise 2>/dev/null
docker rm ollama flowise 2>/dev/null

# Ollama with Traefik
docker run -d \
  --name ollama \
  --restart unless-stopped \
  --network $NETWORK \
  -v ollama:/root/.ollama \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.ollama.rule=Host(\`ollama.agistaffers.com\`)" \
  --label "traefik.http.services.ollama.loadbalancer.server.port=11434" \
  --label "traefik.http.routers.ollama.tls=true" \
  --label "traefik.http.routers.ollama.tls.certresolver=letsencrypt" \
  ollama/ollama

# Flowise with Traefik
docker run -d \
  --name flowise \
  --restart unless-stopped \
  --network $NETWORK \
  -e FLOWISE_USERNAME=admin \
  -e FLOWISE_PASSWORD=admin123 \
  -v flowise_data:/root/.flowise \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.flowise.rule=Host(\`flowise.agistaffers.com\`)" \
  --label "traefik.http.services.flowise.loadbalancer.server.port=3000" \
  --label "traefik.http.routers.flowise.tls=true" \
  --label "traefik.http.routers.flowise.tls.certresolver=letsencrypt" \
  flowiseai/flowise
```

## Verify Everything is Working

After running the commands above:

1. **Check containers are running:**
   ```bash
   docker ps | grep -E "ollama|flowise"
   ```

2. **Test Ollama:**
   ```bash
   curl https://ollama.agistaffers.com/api/tags
   ```

3. **Test Flowise:**
   ```bash
   curl -I https://flowise.agistaffers.com
   ```

4. **View logs if needed:**
   ```bash
   docker logs ollama
   docker logs flowise
   ```

## Expected Results:
- ✅ https://ollama.agistaffers.com - Should show Ollama API
- ✅ https://flowise.agistaffers.com - Should show Flowise login (admin/admin123)

## If Still Having Issues:

1. **Check DNS:**
   ```bash
   dig ollama.agistaffers.com +short
   dig flowise.agistaffers.com +short
   # Should return your server's IP
   ```

2. **Check firewall:**
   ```bash
   ufw status
   # Ensure ports 80 and 443 are allowed
   ```

3. **Force SSL renewal:**
   ```bash
   certbot renew --force-renewal
   ```

4. **Check which reverse proxy you have:**
   ```bash
   docker ps | grep -E "traefik|nginx|caddy"
   systemctl status nginx
   ```