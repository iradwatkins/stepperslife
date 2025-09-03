#!/bin/bash
# Emergency rebuild script for missing pages

ssh root@72.60.28.175 << 'EOF'
cd /opt/stepperslife
# Force rebuild without cache
docker build --no-cache --build-arg CACHE_BUST=$(date +%s) -t stepperslife:latest .
docker stop stepperslife-prod && docker rm stepperslife-prod
docker run -d --name stepperslife-prod --restart unless-stopped --network dokploy-network -p 3000:3000 --env-file .env.production --label "traefik.enable=true" --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`) || Host(\`www.stepperslife.com\`)" --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" stepperslife:latest
echo "Rebuild complete!"
EOF
