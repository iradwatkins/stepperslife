# Port Assignment Registry
Last Updated: 2025-08-27

## Production Services (Public Access via Traefik)
| Service | Port | Directory | Domain | Status |
|---------|------|-----------|--------|--------|
| Traefik Proxy | 80, 443 | Docker | All domains | ✅ Active |
| Traefik Dashboard | 8080 | Docker | traefik.local | ✅ Active |

## Application Ports (3000-3999)
| Service | Port | Directory | Purpose | Status |
|---------|------|-----------|---------|--------|
| Dokploy Dashboard | 3000 | Docker | Platform management | ✅ Active |
| SteppersLife (Dev) | 3001 | /var/www/stepperslife-github | Development/Testing | ✅ Active |
| SteppersLife (Prod) | 3002 | /var/www/stepperslife-fresh | Production via Docker | ✅ Active |
| SteppersLife (Old) | 3003 | /var/www/stepperslife.com | Legacy/Backup | ❌ Inactive |
| Available | 3004 | - | Reserved | - |
| Available | 3005 | - | Reserved | - |

## Database & Storage Ports (5000-6999)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| PostgreSQL | 5432 | Main database | ✅ Active |
| n8n | 5678 | Workflow automation | ✅ Active |
| Redis | 6379 | Cache/Sessions | ✅ Active |

## Admin & Upload Services (8000-8999)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| Traefik UI | 8080 | Proxy dashboard | ✅ Active |
| Coolify Upload | 8081 | PM2 upload service | ✅ Active |
| Dokploy Upload | 8082 | Docker upload service | ✅ Active |
| Available | 8083-8099 | Reserved for admin tools | - |

## Storage & AI Services (9000+)
| Service | Port | Purpose | Status |
|---------|------|---------|--------|
| MinIO Console | 9000 | Object storage UI | ✅ Active |
| MinIO API | 9001 | S3-compatible API | ✅ Active |
| Ollama | 11434 | AI model service | ✅ Active |

## Port Assignment Rules
1. **3000-3099**: Web applications (Next.js, React, etc.)
2. **5000-5999**: Databases and data services
3. **6000-6999**: Cache and message queues
4. **8000-8999**: Admin interfaces and utility services
5. **9000-9999**: Storage services
6. **10000+**: Special services (AI, monitoring, etc.)

## Environment Variables Template
```bash
# SteppersLife Development
STEPPERSLIFE_DEV_PORT=3001
STEPPERSLIFE_DEV_DIR=/var/www/stepperslife-github

# SteppersLife Production
STEPPERSLIFE_PROD_PORT=3002
STEPPERSLIFE_PROD_DIR=/var/www/stepperslife-fresh

# Database
DATABASE_PORT=5432
REDIS_PORT=6379

# Storage
MINIO_PORT=9000
MINIO_CONSOLE_PORT=9001
```

## Quick Commands
```bash
# Check port usage
netstat -tulpn | grep LISTEN

# PM2 processes
pm2 list

# Docker port mappings
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Kill process on specific port
lsof -ti:PORT | xargs kill -9
```

## Notes
- All public traffic goes through Traefik on ports 80/443
- Direct port access should be restricted via firewall
- Docker containers use internal networking where possible
- PM2 processes run directly on host