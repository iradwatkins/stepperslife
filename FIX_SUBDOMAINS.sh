#!/bin/bash

# Fix Subdomains Script for SteppersLife
# This script restarts all subdomain services

SERVER_IP="72.60.28.175"
SERVER_PASSWORD="Bobby321&Gloria321Watkins?"

echo "======================================"
echo "Fixing SteppersLife Subdomains"
echo "======================================"
echo ""

# SSH into server and restart services
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no root@$SERVER_IP << 'ENDSSH'

echo "Checking Docker containers..."
docker ps -a --format "table {{.Names}}\t{{.Status}}" | grep -E "n8n|chat|flowise|deploy|dokploy"

echo ""
echo "Restarting Dokploy services..."

# Check if Dokploy is running
if docker ps | grep -q dokploy; then
    echo "Dokploy is running"
    docker exec dokploy docker ps
else
    echo "Starting Dokploy..."
    docker start dokploy 2>/dev/null || echo "Dokploy container not found"
fi

# Start n8n service
echo ""
echo "Starting n8n service..."
docker run -d --name n8n \
  --restart unless-stopped \
  --network dokploy-network \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=false \
  -e N8N_HOST=n8n.agistaffers.com \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=https \
  -e WEBHOOK_URL=https://n8n.agistaffers.com/ \
  -v n8n_data:/home/node/.n8n \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.n8n.rule=Host(\`n8n.agistaffers.com\`)" \
  --label "traefik.http.services.n8n.loadbalancer.server.port=5678" \
  --label "traefik.http.routers.n8n.tls=true" \
  --label "traefik.http.routers.n8n.tls.certresolver=letsencrypt" \
  n8nio/n8n:latest 2>/dev/null || docker restart n8n

# Start Open WebUI (chat)
echo ""
echo "Starting Open WebUI service..."
docker run -d --name open-webui \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3010:8080 \
  -v open-webui:/app/backend/data \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.chat.rule=Host(\`chat.agistaffers.com\`)" \
  --label "traefik.http.services.chat.loadbalancer.server.port=8080" \
  --label "traefik.http.routers.chat.tls=true" \
  --label "traefik.http.routers.chat.tls.certresolver=letsencrypt" \
  ghcr.io/open-webui/open-webui:main 2>/dev/null || docker restart open-webui

# Start Flowise
echo ""
echo "Starting Flowise service..."
docker run -d --name flowise \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3002:3000 \
  -v flowise_data:/root/.flowise \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.flowise.rule=Host(\`flowise.agistaffers.com\`)" \
  --label "traefik.http.services.flowise.loadbalancer.server.port=3000" \
  --label "traefik.http.routers.flowise.tls=true" \
  --label "traefik.http.routers.flowise.tls.certresolver=letsencrypt" \
  flowiseai/flowise:latest 2>/dev/null || docker restart flowise

# Check Traefik is running
echo ""
echo "Checking Traefik status..."
docker ps | grep traefik || echo "WARNING: Traefik not running!"

# Restart Traefik if needed
if ! docker ps | grep -q traefik; then
    echo "Starting Traefik..."
    docker run -d --name traefik \
      --restart unless-stopped \
      --network dokploy-network \
      -p 80:80 \
      -p 443:443 \
      -p 8080:8080 \
      -v /var/run/docker.sock:/var/run/docker.sock:ro \
      -v traefik-public-certificates:/certificates \
      --label "traefik.enable=true" \
      --label "traefik.http.routers.traefik.rule=Host(\`deploy.agistaffers.com\`)" \
      --label "traefik.http.services.traefik.loadbalancer.server.port=8080" \
      traefik:v2.10
fi

echo ""
echo "All services restarted. Checking status..."
sleep 5

# Check all services
echo ""
echo "Service Status:"
echo "==============="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "n8n|chat|flowise|traefik|dokploy|steppers"

ENDSSH

echo ""
echo "Testing subdomain accessibility..."
echo "===================================="

# Test each subdomain
for domain in n8n.agistaffers.com chat.agistaffers.com flowise.agistaffers.com deploy.agistaffers.com; do
    echo -n "Testing $domain: "
    status=$(curl -s -o /dev/null -w "%{http_code}" -I https://$domain 2>/dev/null)
    if [ "$status" = "200" ] || [ "$status" = "301" ] || [ "$status" = "302" ]; then
        echo "✅ OK (HTTP $status)"
    else
        echo "❌ Failed (HTTP $status)"
    fi
done

echo ""
echo "Main site status:"
echo -n "Testing stepperslife.com: "
status=$(curl -s -o /dev/null -w "%{http_code}" -I https://stepperslife.com 2>/dev/null)
if [ "$status" = "200" ]; then
    echo "✅ OK (HTTP $status)"
else
    echo "⚠️ Status: HTTP $status"
fi

echo ""
echo "======================================"
echo "Subdomain Fix Complete!"
echo "======================================"