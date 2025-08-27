# Port Management Guide for Server

## Quick Reference

### Primary Applications
- **3001**: SteppersLife Development (PM2 - `/var/www/stepperslife-github`)
- **3002**: SteppersLife Production (Docker - `/var/www/stepperslife-fresh`)
- **3000**: Dokploy Dashboard (Docker)

### Support Services
- **80/443**: Traefik (Reverse Proxy)
- **5432**: PostgreSQL
- **6379**: Redis
- **8081**: Upload Service (PM2)
- **9000-9001**: MinIO Storage

## Managing Services

### Check Port Status
```bash
# See all listening ports
netstat -tulpn | grep LISTEN

# Check specific port
lsof -i :3001

# Kill process on port
lsof -ti:3001 | xargs kill -9
```

### PM2 Services (Direct on Host)
```bash
# List all PM2 services
pm2 list

# Start SteppersLife Dev
cd /var/www/stepperslife-github
pm2 start npm --name "stepperslife-3001" -- start

# Stop/Restart
pm2 stop stepperslife-3001
pm2 restart stepperslife-3001

# View logs
pm2 logs stepperslife-3001

# Save configuration
pm2 save
```

### Docker Services
```bash
# List all containers with ports
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"

# Restart specific container
docker restart stepperslife_app

# View container logs
docker logs stepperslife_app -f
```

## Application URLs

### Development Access
- SteppersLife Dev: http://localhost:3001
- SteppersLife Prod: http://localhost:3002
- Dokploy: http://localhost:3000

### Public Access (via Traefik)
- Production: https://stepperslife.com (→ port 3002)
- Staging: https://dev.stepperslife.com (→ port 3001)

## Troubleshooting

### Port Already in Use
```bash
# Find what's using port
lsof -i :3001

# Force kill and restart
lsof -ti:3001 | xargs kill -9
pm2 restart stepperslife-3001
```

### PM2 Process Won't Start
```bash
# Delete and recreate
pm2 delete stepperslife-3001
cd /var/www/stepperslife-github
pm2 start npm --name "stepperslife-3001" -- start
pm2 save
```

### Docker Container Port Conflicts
```bash
# Stop conflicting container
docker stop container_name

# Remove and recreate
docker rm container_name
docker-compose up -d
```

## Environment Configuration

Each application should have port defined in:
1. `package.json` scripts (for Next.js apps)
2. `.env` or `.env.local` file
3. PM2 ecosystem file (if applicable)
4. Docker compose file (if containerized)

## Adding New Services

1. Check available port in `/var/www/PORT_ASSIGNMENTS.md`
2. Update port assignment document
3. Configure application to use assigned port
4. Start service with clear naming convention
5. Update this README with new service

## Security Notes

- Only ports 80/443 should be exposed publicly
- All other ports should be accessed via reverse proxy
- Use firewall rules to restrict direct port access
- Regular port audit: `netstat -tulpn | grep LISTEN`

## Maintenance Commands

```bash
# Full restart of PM2 services
pm2 restart all

# Check system resources
htop

# Check disk usage
df -h

# View all logs
pm2 logs

# Clear PM2 logs
pm2 flush

# Backup PM2 configuration
pm2 save
```

## Contact & Support

For issues with port assignments or service conflicts, check:
1. `/var/www/PORT_ASSIGNMENTS.md` - Official port registry
2. PM2 logs: `pm2 logs [service-name]`
3. Docker logs: `docker logs [container-name]`
4. System logs: `journalctl -xe`