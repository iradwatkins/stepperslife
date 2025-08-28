#!/bin/bash

# Fix Script for Both Ollama and Flowise Sites
# This script will fix SSL certificates and Bad Gateway errors

# Configuration
OLLAMA_DOMAIN="ollama.agistaffers.com"
FLOWISE_DOMAIN="flowise.agistaffers.com"
EMAIL="admin@agistaffers.com"
NETWORK="web"  # Change to "dokploy-network" if using Dokploy

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Fixing Both Ollama and Flowise Sites ===${NC}"
echo ""

# Function to check if site is working
check_site() {
    local url=$1
    local response=$(curl -s -o /dev/null -w "%{http_code}" -k $url)
    if [ $response -eq 200 ] || [ $response -eq 301 ] || [ $response -eq 302 ]; then
        echo -e "${GREEN}✅ $url is responding (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}❌ $url is not working (HTTP $response)${NC}"
        return 1
    fi
}

# Function to get/renew SSL certificate
get_ssl_cert() {
    local domain=$1
    echo -e "${YELLOW}Getting SSL certificate for $domain...${NC}"
    
    # Try with nginx first
    certbot certonly --nginx -d $domain \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        --force-renewal 2>/dev/null
    
    if [ $? -ne 0 ]; then
        # Try standalone if nginx fails
        echo "Nginx method failed, trying standalone..."
        certbot certonly --standalone -d $domain \
            --non-interactive \
            --agree-tos \
            --email $EMAIL \
            --force-renewal
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSL certificate obtained for $domain${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to get SSL certificate for $domain${NC}"
        return 1
    fi
}

# 1. Fix Ollama
echo -e "${YELLOW}=== Fixing Ollama ===${NC}"

# Stop existing Ollama container
docker stop ollama 2>/dev/null && echo "Stopped existing Ollama container"
docker rm ollama 2>/dev/null

# Get SSL certificate for Ollama
get_ssl_cert $OLLAMA_DOMAIN

# Deploy Ollama with proper configuration
echo "Deploying Ollama..."
docker run -d \
    --name ollama \
    --restart unless-stopped \
    --network $NETWORK \
    -v ollama:/root/.ollama \
    -p 11434:11434 \
    --label "traefik.enable=true" \
    --label "traefik.http.routers.ollama.rule=Host(\`$OLLAMA_DOMAIN\`)" \
    --label "traefik.http.services.ollama.loadbalancer.server.port=11434" \
    --label "traefik.http.routers.ollama.tls=true" \
    --label "traefik.http.routers.ollama.tls.certresolver=letsencrypt" \
    --label "traefik.http.routers.ollama.entrypoints=websecure" \
    --label "traefik.http.middlewares.ollama-https.redirectscheme.scheme=https" \
    --label "traefik.http.routers.ollama-http.rule=Host(\`$OLLAMA_DOMAIN\`)" \
    --label "traefik.http.routers.ollama-http.entrypoints=web" \
    --label "traefik.http.routers.ollama-http.middlewares=ollama-https" \
    ollama/ollama

# Wait for Ollama to start
sleep 5

# Check if Ollama is running
if docker ps | grep -q ollama; then
    echo -e "${GREEN}✅ Ollama container is running${NC}"
    
    # Pull a model if none exists
    if ! docker exec ollama ollama list | grep -q "llama"; then
        echo "Pulling llama2 model (this may take a while)..."
        docker exec ollama ollama pull llama2:7b
    fi
else
    echo -e "${RED}❌ Ollama container failed to start${NC}"
    docker logs ollama | tail -20
fi

echo ""

# 2. Fix Flowise
echo -e "${YELLOW}=== Fixing Flowise ===${NC}"

# Stop existing Flowise container
docker stop flowise 2>/dev/null && echo "Stopped existing Flowise container"
docker rm flowise 2>/dev/null

# Get SSL certificate for Flowise
get_ssl_cert $FLOWISE_DOMAIN

# Deploy Flowise with proper configuration
echo "Deploying Flowise..."
docker run -d \
    --name flowise \
    --restart unless-stopped \
    --network $NETWORK \
    -e FLOWISE_USERNAME=admin \
    -e FLOWISE_PASSWORD=FloWise2024! \
    -e DATABASE_TYPE=sqlite \
    -e DATABASE_PATH=/root/.flowise \
    -e APIKEY_PATH=/root/.flowise \
    -e SECRETKEY_PATH=/root/.flowise \
    -e LOG_PATH=/root/.flowise/logs \
    -e FLOWISE_SECRETKEY_OVERWRITE=mySecretKey123 \
    -v flowise_data:/root/.flowise \
    -p 3000:3000 \
    --label "traefik.enable=true" \
    --label "traefik.http.routers.flowise.rule=Host(\`$FLOWISE_DOMAIN\`)" \
    --label "traefik.http.services.flowise.loadbalancer.server.port=3000" \
    --label "traefik.http.routers.flowise.tls=true" \
    --label "traefik.http.routers.flowise.tls.certresolver=letsencrypt" \
    --label "traefik.http.routers.flowise.entrypoints=websecure" \
    --label "traefik.http.middlewares.flowise-https.redirectscheme.scheme=https" \
    --label "traefik.http.routers.flowise-http.rule=Host(\`$FLOWISE_DOMAIN\`)" \
    --label "traefik.http.routers.flowise-http.entrypoints=web" \
    --label "traefik.http.routers.flowise-http.middlewares=flowise-https" \
    flowiseai/flowise

# Wait for Flowise to start
sleep 10

# Check if Flowise is running
if docker ps | grep -q flowise; then
    echo -e "${GREEN}✅ Flowise container is running${NC}"
else
    echo -e "${RED}❌ Flowise container failed to start${NC}"
    docker logs flowise | tail -20
fi

echo ""

# 3. Setup Nginx fallback (if Traefik labels don't work)
if command -v nginx &> /dev/null; then
    echo -e "${YELLOW}=== Setting up Nginx configuration ===${NC}"
    
    # Ollama Nginx config
    cat > /etc/nginx/sites-available/ollama.conf << EOF
server {
    listen 80;
    server_name $OLLAMA_DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $OLLAMA_DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$OLLAMA_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$OLLAMA_DOMAIN/privkey.pem;
    
    location / {
        proxy_pass http://localhost:11434;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
EOF

    # Flowise Nginx config
    cat > /etc/nginx/sites-available/flowise.conf << EOF
server {
    listen 80;
    server_name $FLOWISE_DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $FLOWISE_DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$FLOWISE_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$FLOWISE_DOMAIN/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # Enable sites
    ln -sf /etc/nginx/sites-available/ollama.conf /etc/nginx/sites-enabled/
    ln -sf /etc/nginx/sites-available/flowise.conf /etc/nginx/sites-enabled/
    
    # Test and reload Nginx
    nginx -t && systemctl reload nginx
    echo -e "${GREEN}✅ Nginx configuration updated${NC}"
fi

echo ""

# 4. Final verification
echo -e "${YELLOW}=== Verifying Sites ===${NC}"

# Wait a bit for services to fully start
sleep 5

# Test Ollama
echo -e "\n${YELLOW}Testing Ollama:${NC}"
check_site "https://$OLLAMA_DOMAIN/api/tags"

# Test local Ollama
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Ollama API is responding locally${NC}"
else
    echo -e "${RED}❌ Ollama API is not responding locally${NC}"
fi

# Test Flowise
echo -e "\n${YELLOW}Testing Flowise:${NC}"
check_site "https://$FLOWISE_DOMAIN"

# Test local Flowise
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Flowise is responding locally${NC}"
else
    echo -e "${RED}❌ Flowise is not responding locally${NC}"
fi

echo ""

# 5. Display summary
echo -e "${GREEN}=== Summary ===${NC}"
echo ""
echo "Ollama:"
echo "  URL: https://$OLLAMA_DOMAIN"
echo "  API: https://$OLLAMA_DOMAIN/api/tags"
echo ""
echo "Flowise:"
echo "  URL: https://$FLOWISE_DOMAIN"
echo "  Username: admin"
echo "  Password: FloWise2024!"
echo ""

# Show running containers
echo -e "${YELLOW}Running containers:${NC}"
docker ps | grep -E "ollama|flowise"

echo ""
echo -e "${GREEN}Script completed!${NC}"
echo ""
echo "If sites are still not working, check:"
echo "1. DNS records point to this server"
echo "2. Firewall allows ports 80 and 443"
echo "3. Docker logs: docker logs ollama"
echo "4. Docker logs: docker logs flowise"