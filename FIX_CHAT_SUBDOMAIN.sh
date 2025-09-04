#!/bin/bash

# Fix Chat Subdomain (Open WebUI)
# This script fixes the chat.agistaffers.com deployment

echo "======================================"
echo "Fixing chat.agistaffers.com"
echo "======================================"
echo ""

# Test current status
echo "Current status:"
curl -s -o /dev/null -w "chat.agistaffers.com: HTTP %{http_code}\n" -I https://chat.agistaffers.com

# Try alternative deployment without Ollama dependency
cat > /tmp/fix_chat.sh << 'SCRIPT'
#!/bin/bash

echo "Fixing Open WebUI deployment..."

# Stop existing container
docker stop open-webui 2>/dev/null || true
docker rm open-webui 2>/dev/null || true

# Create volume if it doesn't exist
docker volume create open-webui 2>/dev/null || true

# Deploy Open WebUI without Ollama dependency (standalone mode)
docker run -d --name open-webui \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3010:8080 \
  -e ENABLE_SIGNUP=true \
  -e DEFAULT_MODELS=gpt-3.5-turbo \
  -e WEBUI_AUTH=false \
  -v open-webui:/app/backend/data \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.chat.rule=Host(\`chat.agistaffers.com\`)" \
  --label "traefik.http.services.chat.loadbalancer.server.port=8080" \
  --label "traefik.http.routers.chat.tls=true" \
  --label "traefik.http.routers.chat.tls.certresolver=letsencrypt" \
  ghcr.io/open-webui/open-webui:main

# Check if it's running
sleep 5
docker ps | grep open-webui
SCRIPT

echo ""
echo "Deployment script created at /tmp/fix_chat.sh"
echo ""
echo "To fix the chat subdomain:"
echo "1. Access the server"
echo "2. Run: bash /tmp/fix_chat.sh"
echo ""
echo "Alternative: Use a simpler chat interface..."

# Create alternative lightweight chat deployment
cat > /tmp/simple_chat.sh << 'ALTSCRIPT'
#!/bin/bash

echo "Deploying lightweight chat interface..."

# Stop existing container
docker stop open-webui simple-chat 2>/dev/null || true
docker rm open-webui simple-chat 2>/dev/null || true

# Deploy a simpler alternative - Chatbot UI
docker run -d --name simple-chat \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3010:3000 \
  -e OPENAI_API_KEY=your-api-key-here \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.chat.rule=Host(\`chat.agistaffers.com\`)" \
  --label "traefik.http.services.chat.loadbalancer.server.port=3000" \
  --label "traefik.http.routers.chat.tls=true" \
  --label "traefik.http.routers.chat.tls.certresolver=letsencrypt" \
  ghcr.io/mckaywrigley/chatbot-ui:main

# Check if it's running
sleep 5
docker ps | grep simple-chat
ALTSCRIPT

echo ""
echo "Alternative lightweight chat script created at /tmp/simple_chat.sh"