# SERVER INFRASTRUCTURE DOCUMENTATION
**Generated**: 2025-08-29
**Server IP**: 72.60.28.175
**Critical**: DO NOT MODIFY THIS SETUP - Everything is working perfectly

## 🚨 CRITICAL RULES
1. **NO TRAEFIK** - Traefik has been removed and must NOT be reinstalled
2. **NO CHANGES TO NGINX** - Nginx is handling all routing correctly
3. **NO PORT CHANGES** - All ports are correctly assigned
4. **DOCKER ONLY** - Docker handles all container networking
5. **NO DOKPLOY PROXY CHANGES** - Dokploy manages its own services

## 📊 CURRENT ARCHITECTURE

### System Components
- **Reverse Proxy**: Nginx (host system)
- **Container Runtime**: Docker
- **SSL Management**: Certbot/Let's Encrypt
- **Deployment Platform**: Dokploy (port 3000)
- **NO TRAEFIK**: Removed permanently

## 🌐 ACTIVE DOMAINS & SERVICES

| Domain | Service | Container | Port | SSL Expiry | Status |
|--------|---------|-----------|------|------------|--------|
| stepperslife.com | SteppersLife Platform | stepperslife-prod | 3000 (internal) | Nov 27, 2025 | ✅ LIVE |
| n8n.agistaffers.com | N8n Automation | n8n | 5678 | Nov 27, 2025 | ✅ LIVE |
| chat.agistaffers.com | Open WebUI | open-webui | 3010 | Nov 27, 2025 | ✅ LIVE |
| flowise.agistaffers.com | Flowise AI | flowise | 3002 | Nov 27, 2025 | ✅ LIVE |
| deploy.agistaffers.com | Dokploy Upload | dokploy_upload | 8082 | Nov 27, 2025 | ✅ LIVE |

## 🐳 DOCKER CONTAINERS

### Running Containers (DO NOT MODIFY)
```
CONTAINER NAME          IMAGE                                  PORT MAPPING
stepperslife-prod       stepperslife:latest                   No external port (nginx proxy)
open-webui              ghcr.io/open-webui/open-webui:main   3010->8080
n8n                     n8nio/n8n:latest                      5678->5678
flowise                 flowiseai/flowise:latest              3002->3000
ollama                  ollama/ollama:latest                  11434->11434
dokploy                 dokploy/dokploy:latest                3000->3000
dokploy_upload          node:18-alpine                        8082->3000
dokploy-postgres        postgres:16                           5432 (internal)
redis_custom            redis:alpine                          6379->6379
minio                   minio/minio                           9000-9001->9000-9001
postgres_custom         postgres:15                           5432->5432
```

## 🔧 NGINX CONFIGURATION

### Site Configurations (Located in /etc/nginx/sites-available/)
```
stepperslife        -> proxy_pass http://172.17.0.2:3000
n8n-agistaffers     -> proxy_pass http://localhost:5678
chat-agistaffers    -> proxy_pass http://localhost:3010
flowise-agistaffers -> proxy_pass http://localhost:3002
deploy-agistaffers  -> proxy_pass http://localhost:8082
```

### DO NOT MODIFY NGINX
- Nginx is correctly configured
- All SSL certificates are managed by Certbot
- Automatic renewal is configured

## 🔒 SSL CERTIFICATES

### Certificate Status
All certificates valid until **November 27, 2025** (89 days)
- Managed by Certbot
- Auto-renewal configured
- Located in /etc/letsencrypt/live/

### Certificate Renewal Command (if needed)
```bash
certbot renew --nginx
```

## 🚀 STEPPERSLIFE.COM SPECIFIC

### Container Details
- **Name**: stepperslife-prod
- **Image**: stepperslife:latest
- **Network**: bridge (172.17.0.2)
- **Port**: 3000 (internal only)
- **Restart Policy**: unless-stopped
- **Environment File**: /opt/stepperslife/.env.production

### Repository
- **GitHub**: https://github.com/iradwatkins/stepperslife.git
- **Location**: /opt/stepperslife
- **Branch**: main

### Key Environment Variables
```
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50
NEXTAUTH_URL=https://stepperslife.com
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621
DATABASE_URL=file:./dev.db
```

### Deployment Process
```bash
cd /opt/stepperslife
git pull
docker build -t stepperslife:latest .
docker stop stepperslife-prod
docker rm stepperslife-prod
docker run -d --name stepperslife-prod \
  --restart unless-stopped \
  --network bridge \
  --env-file .env.production \
  stepperslife:latest
```

## 🛑 WHAT NOT TO DO

### NEVER:
1. ❌ Install or start Traefik
2. ❌ Change nginx proxy_pass configurations
3. ❌ Modify container port mappings
4. ❌ Change Docker network settings
5. ❌ Update Dokploy proxy settings
6. ❌ Remove or modify SSL certificates
7. ❌ Change container names
8. ❌ Modify /etc/nginx/sites-available files

### REMOVED SERVICES (DO NOT REINSTALL):
- ❌ dokploy-traefik (removed permanently)
- ❌ dokploy_web_proxy (removed permanently)
- ❌ ollama.agistaffers.com (removed, replaced with flowise)

## 📝 MAINTENANCE COMMANDS

### Check All Services
```bash
# Check container status
docker ps

# Check nginx status
systemctl status nginx

# Check SSL certificates
certbot certificates

# Test all domains
for domain in stepperslife.com n8n.agistaffers.com chat.agistaffers.com flowise.agistaffers.com deploy.agistaffers.com; do
  echo "$domain:"
  curl -I https://$domain | head -1
done
```

### Restart Services (if needed)
```bash
# Restart nginx
systemctl restart nginx

# Restart a container
docker restart [container-name]

# View container logs
docker logs [container-name] --tail 50
```

## ⚠️ IMPORTANT NOTES

1. **Everything is working** - No changes needed
2. **SteppersLife** runs on internal Docker IP, nginx proxies to it
3. **Dokploy** manages its own services on port 3000
4. **All domains** have valid SSL until Nov 27, 2025
5. **No cross-contamination** - Each service is isolated
6. **Backup this document** - Critical for system maintenance

## 🔐 SERVER ACCESS
- SSH: root@72.60.28.175
- Dokploy Dashboard: http://72.60.28.175:3000
- All services: HTTPS only through their domains

---
**DO NOT MODIFY THIS SETUP - IT IS WORKING PERFECTLY**
