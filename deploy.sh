#!/bin/bash
sshpass -p 'Bobby321&Gloria321Watkins?' ssh -o StrictHostKeyChecking=no root@72.60.28.175 << 'ENDSSH'
cd /opt/stepperslife
git pull
docker build -t stepperslife:latest .
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true
docker run -d --name stepperslife-prod \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  stepperslife:latest
docker ps | grep stepperslife
ENDSSH
