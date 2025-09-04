#!/bin/bash

# Deploy Subdomain Services to Dokploy
# This script deploys n8n, Open WebUI, and Flowise services

echo "======================================"
echo "Deploying Subdomain Services"
echo "======================================"
echo ""

SERVER_IP="72.60.28.175"

# Function to deploy via curl to Dokploy API
deploy_to_dokploy() {
    local service_name=$1
    local deployment_file=$2
    
    echo "Deploying $service_name..."
    
    # Try Dokploy API endpoint
    curl -X POST \
        -H "Content-Type: application/json" \
        -d @"$deployment_file" \
        "http://${SERVER_IP}:3000/api/services/deploy" \
        2>/dev/null || echo "Direct API deployment failed, trying alternative method..."
}

# Alternative: Deploy using Docker commands via HTTP API
deploy_via_docker_api() {
    local service_name=$1
    local docker_command=$2
    
    echo "Deploying $service_name via Docker API..."
    
    curl -X POST \
        -H "Content-Type: application/json" \
        -d "{\"command\": \"$docker_command\"}" \
        "http://${SERVER_IP}:2375/v1.41/containers/create" \
        2>/dev/null || echo "Docker API not accessible"
}

# Create deployment commands for each service
echo "Creating deployment commands..."

# n8n deployment command
N8N_DEPLOY_CMD="docker run -d --name n8n \
  --restart unless-stopped \
  --network dokploy-network \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=false \
  -e N8N_HOST=n8n.agistaffers.com \
  -e N8N_PORT=5678 \
  -e N8N_PROTOCOL=https \
  -e WEBHOOK_URL=https://n8n.agistaffers.com/ \
  -v n8n_data:/home/node/.n8n \
  --label 'traefik.enable=true' \
  --label 'traefik.http.routers.n8n.rule=Host(\`n8n.agistaffers.com\`)' \
  --label 'traefik.http.services.n8n.loadbalancer.server.port=5678' \
  --label 'traefik.http.routers.n8n.tls=true' \
  --label 'traefik.http.routers.n8n.tls.certresolver=letsencrypt' \
  n8nio/n8n:latest"

# Open WebUI deployment command
CHAT_DEPLOY_CMD="docker run -d --name open-webui \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3010:8080 \
  -v open-webui:/app/backend/data \
  --label 'traefik.enable=true' \
  --label 'traefik.http.routers.chat.rule=Host(\`chat.agistaffers.com\`)' \
  --label 'traefik.http.services.chat.loadbalancer.server.port=8080' \
  --label 'traefik.http.routers.chat.tls=true' \
  --label 'traefik.http.routers.chat.tls.certresolver=letsencrypt' \
  ghcr.io/open-webui/open-webui:main"

# Flowise deployment command
FLOWISE_DEPLOY_CMD="docker run -d --name flowise \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3002:3000 \
  -e PORT=3000 \
  -e FLOWISE_USERNAME=admin \
  -e FLOWISE_PASSWORD=flowise123 \
  -v flowise_data:/root/.flowise \
  --label 'traefik.enable=true' \
  --label 'traefik.http.routers.flowise.rule=Host(\`flowise.agistaffers.com\`)' \
  --label 'traefik.http.services.flowise.loadbalancer.server.port=3000' \
  --label 'traefik.http.routers.flowise.tls=true' \
  --label 'traefik.http.routers.flowise.tls.certresolver=letsencrypt' \
  flowiseai/flowise:latest"

# Generate API deployment request
echo "Generating Dokploy API deployment request..."

cat > /tmp/dokploy_deploy.json << 'EOF'
{
  "projectName": "agistaffers-services",
  "services": [
    {
      "name": "n8n",
      "image": "n8nio/n8n:latest",
      "ports": ["5678:5678"],
      "environment": {
        "N8N_BASIC_AUTH_ACTIVE": "false",
        "N8N_HOST": "n8n.agistaffers.com",
        "N8N_PORT": "5678",
        "N8N_PROTOCOL": "https",
        "WEBHOOK_URL": "https://n8n.agistaffers.com/"
      },
      "domains": ["n8n.agistaffers.com"],
      "volumes": ["n8n_data:/home/node/.n8n"]
    },
    {
      "name": "open-webui",
      "image": "ghcr.io/open-webui/open-webui:main",
      "ports": ["3010:8080"],
      "domains": ["chat.agistaffers.com"],
      "volumes": ["open-webui:/app/backend/data"]
    },
    {
      "name": "flowise",
      "image": "flowiseai/flowise:latest",
      "ports": ["3002:3000"],
      "environment": {
        "PORT": "3000",
        "FLOWISE_USERNAME": "admin",
        "FLOWISE_PASSWORD": "flowise123"
      },
      "domains": ["flowise.agistaffers.com"],
      "volumes": ["flowise_data:/root/.flowise"]
    }
  ]
}
EOF

# Try to deploy via Dokploy API
echo ""
echo "Attempting Dokploy API deployment..."
curl -X POST \
    -H "Content-Type: application/json" \
    -d @/tmp/dokploy_deploy.json \
    "http://${SERVER_IP}:3000/api/projects/create" \
    2>/dev/null || echo "Dokploy API not accessible"

# Alternative: Create a deployment script to run on the server
echo ""
echo "Creating server deployment script..."

cat > /tmp/deploy_on_server.sh << 'DEPLOY_SCRIPT'
#!/bin/bash

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root"
    exit 1
fi

echo "Deploying services on server..."

# Ensure Docker is running
systemctl start docker 2>/dev/null || service docker start 2>/dev/null

# Create dokploy network if it doesn't exist
docker network create dokploy-network 2>/dev/null || true

# Create volumes
docker volume create n8n_data 2>/dev/null || true
docker volume create open-webui 2>/dev/null || true
docker volume create flowise_data 2>/dev/null || true
docker volume create ollama_data 2>/dev/null || true

# Stop and remove existing containers
docker stop n8n open-webui flowise ollama 2>/dev/null || true
docker rm n8n open-webui flowise ollama 2>/dev/null || true

# Deploy n8n
echo "Deploying n8n..."
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
  n8nio/n8n:latest

# Deploy Ollama (for Open WebUI)
echo "Deploying Ollama..."
docker run -d --name ollama \
  --restart unless-stopped \
  --network dokploy-network \
  -p 11434:11434 \
  -v ollama_data:/root/.ollama \
  ollama/ollama:latest

# Deploy Open WebUI
echo "Deploying Open WebUI..."
docker run -d --name open-webui \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3010:8080 \
  -e OLLAMA_BASE_URL=http://ollama:11434 \
  -v open-webui:/app/backend/data \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.chat.rule=Host(\`chat.agistaffers.com\`)" \
  --label "traefik.http.services.chat.loadbalancer.server.port=8080" \
  --label "traefik.http.routers.chat.tls=true" \
  --label "traefik.http.routers.chat.tls.certresolver=letsencrypt" \
  ghcr.io/open-webui/open-webui:main

# Deploy Flowise
echo "Deploying Flowise..."
docker run -d --name flowise \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3002:3000 \
  -e PORT=3000 \
  -e FLOWISE_USERNAME=admin \
  -e FLOWISE_PASSWORD=flowise123 \
  -v flowise_data:/root/.flowise \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.flowise.rule=Host(\`flowise.agistaffers.com\`)" \
  --label "traefik.http.services.flowise.loadbalancer.server.port=3000" \
  --label "traefik.http.routers.flowise.tls=true" \
  --label "traefik.http.routers.flowise.tls.certresolver=letsencrypt" \
  flowiseai/flowise:latest

# Ensure Traefik is running
if ! docker ps | grep -q traefik; then
    echo "Starting Traefik..."
    docker run -d --name traefik \
      --restart unless-stopped \
      --network dokploy-network \
      -p 80:80 \
      -p 443:443 \
      -v /var/run/docker.sock:/var/run/docker.sock:ro \
      -v traefik-public-certificates:/certificates \
      -v traefik-config:/etc/traefik \
      --label "traefik.enable=true" \
      traefik:v2.10 \
      --providers.docker=true \
      --providers.docker.exposedbydefault=false \
      --entrypoints.web.address=:80 \
      --entrypoints.websecure.address=:443 \
      --certificatesresolvers.letsencrypt.acme.tlschallenge=true \
      --certificatesresolvers.letsencrypt.acme.email=admin@agistaffers.com \
      --certificatesresolvers.letsencrypt.acme.storage=/certificates/acme.json \
      --api.dashboard=true
fi

echo ""
echo "Checking deployed services..."
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "n8n|open-webui|flowise|ollama|traefik"

echo ""
echo "Services deployed successfully!"
echo "Access points:"
echo "  - n8n: https://n8n.agistaffers.com"
echo "  - Chat: https://chat.agistaffers.com"
echo "  - Flowise: https://flowise.agistaffers.com (admin/flowise123)"
DEPLOY_SCRIPT

echo ""
echo "======================================"
echo "Deployment Script Created"
echo "======================================"
echo ""
echo "The deployment script has been created at: /tmp/deploy_on_server.sh"
echo ""
echo "To deploy the services, you need to:"
echo "1. Copy this script to the server"
echo "2. Run it as root"
echo ""
echo "Testing subdomain status..."
echo "======================================"

# Test each subdomain
for domain in n8n.agistaffers.com chat.agistaffers.com flowise.agistaffers.com; do
    echo -n "Testing $domain: "
    status=$(curl -s -o /dev/null -w "%{http_code}" -I https://$domain 2>/dev/null)
    if [ "$status" = "200" ] || [ "$status" = "301" ] || [ "$status" = "302" ]; then
        echo "✅ OK (HTTP $status)"
    else
        echo "❌ Not yet deployed (HTTP $status)"
    fi
done

echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo "1. Access server via Hostinger console or SSH"
echo "2. Run the deployment script: bash /tmp/deploy_on_server.sh"
echo "3. Verify services are running: docker ps"
echo "4. Test subdomains are accessible"