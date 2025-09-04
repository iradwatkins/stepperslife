#!/bin/bash
echo "🚨 Emergency Deployment Starting..."
sshpass -p 'Bobby321&Gloria321Watkins?' ssh root@72.60.28.175 "docker ps | grep stepperslife || (cd /opt/stepperslife && git pull && docker build -t stepperslife:latest . && docker run -d --name stepperslife-prod --restart unless-stopped --network dokploy-network -p 3000:3000 --env-file .env.production stepperslife:latest)"
echo "✅ Done"
