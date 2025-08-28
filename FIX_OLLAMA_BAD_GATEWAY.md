# Fix for Ollama Bad Gateway (502) Error

## Quick Diagnosis Commands

SSH to the server hosting ollama.agistaffers.com and run:

```bash
# 1. Check if Ollama container is running
docker ps | grep ollama

# 2. Check Ollama logs
docker logs ollama

# 3. Check reverse proxy (Traefik/Nginx)
docker ps | grep -E "traefik|nginx"

# 4. Test Ollama locally
curl http://localhost:11434/api/tags
```

## Common Fixes

### Fix 1: Restart Ollama Service
```bash
# Stop and remove existing container
docker stop ollama
docker rm ollama

# Start Ollama with proper configuration
docker run -d \
  --name ollama \
  --restart unless-stopped \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  ollama/ollama
```

### Fix 2: Fix Reverse Proxy Configuration

#### For Traefik:
```bash
docker run -d \
  --name ollama \
  --restart unless-stopped \
  --network web \
  -v ollama:/root/.ollama \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.ollama.rule=Host(\`ollama.agistaffers.com\`)" \
  --label "traefik.http.services.ollama.loadbalancer.server.port=11434" \
  --label "traefik.http.routers.ollama.tls=true" \
  --label "traefik.http.routers.ollama.tls.certresolver=letsencrypt" \
  ollama/ollama
```

#### For Nginx:
```nginx
server {
    listen 443 ssl http2;
    server_name ollama.agistaffers.com;
    
    ssl_certificate /etc/letsencrypt/live/ollama.agistaffers.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ollama.agistaffers.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:11434;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts for long-running LLM requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

### Fix 3: Check Docker Network
```bash
# List networks
docker network ls

# Ensure Ollama is on the correct network
docker network connect web ollama  # or your proxy network
```

### Fix 4: Memory/Resource Issues
```bash
# Check system resources
free -h
df -h
docker stats

# Restart with memory limits
docker run -d \
  --name ollama \
  --restart unless-stopped \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  --memory="4g" \
  --cpus="2" \
  ollama/ollama
```

### Fix 5: Full Reset
```bash
# Stop everything
docker stop ollama
docker rm ollama

# Remove volume (WARNING: Deletes downloaded models)
docker volume rm ollama

# Fresh start
docker run -d \
  --name ollama \
  --restart unless-stopped \
  --network web \
  -p 11434:11434 \
  -v ollama:/root/.ollama \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.ollama.rule=Host(\`ollama.agistaffers.com\`)" \
  --label "traefik.http.services.ollama.loadbalancer.server.port=11434" \
  ollama/ollama

# Pull a model (e.g., llama2)
docker exec -it ollama ollama pull llama2
```

## Verification Steps

After applying fixes:

1. **Check container status:**
   ```bash
   docker ps | grep ollama
   ```

2. **Test locally:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

3. **Test through domain:**
   ```bash
   curl https://ollama.agistaffers.com/api/tags
   ```

4. **Check logs:**
   ```bash
   docker logs -f ollama
   ```

## Additional Debugging

If still having issues:

1. **Check SSL certificate:**
   ```bash
   certbot certificates | grep ollama
   ```

2. **Test without SSL:**
   ```bash
   curl -k https://ollama.agistaffers.com/
   ```

3. **Check firewall:**
   ```bash
   ufw status
   iptables -L
   ```

4. **DNS verification:**
   ```bash
   dig ollama.agistaffers.com
   nslookup ollama.agistaffers.com
   ```

## Quick Deployment Script

Save as `deploy-ollama.sh`:

```bash
#!/bin/bash

# Configuration
DOMAIN="ollama.agistaffers.com"
NETWORK="web"  # or "dokploy-network" or your network name

echo "Deploying Ollama to $DOMAIN..."

# Stop and remove old container
docker stop ollama 2>/dev/null || true
docker rm ollama 2>/dev/null || true

# Run Ollama
docker run -d \
  --name ollama \
  --restart unless-stopped \
  --network $NETWORK \
  -v ollama:/root/.ollama \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.ollama.rule=Host(\`$DOMAIN\`)" \
  --label "traefik.http.services.ollama.loadbalancer.server.port=11434" \
  --label "traefik.http.routers.ollama.tls=true" \
  --label "traefik.http.routers.ollama.tls.certresolver=letsencrypt" \
  ollama/ollama

# Wait for startup
sleep 5

# Check status
if docker ps | grep -q ollama; then
    echo "✅ Ollama container running"
    
    # Test API
    if curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "✅ Ollama API responding"
        echo "🎉 Deployment successful!"
        echo "Visit: https://$DOMAIN"
    else
        echo "❌ Ollama API not responding"
        docker logs ollama
    fi
else
    echo "❌ Container failed to start"
    docker logs ollama
fi
```

Make executable and run:
```bash
chmod +x deploy-ollama.sh
./deploy-ollama.sh
```