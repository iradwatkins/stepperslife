# CRITICAL: Coolify Deployment Issue - Manual Fix Required

## 🚨 URGENT: Production Stuck on Old Version

### Current Situation
- **Production**: Version 2.0.0 (January 19, 2025) - 7 MONTHS OLD
- **GitHub**: Version 3.1.0 (August 24, 2025) - CURRENT
- **Issue**: Coolify not pulling/building new code despite successful pushes

### What Needs to Deploy
1. **$1.50 per ticket** platform fee (currently showing 3%)
2. **Theme toggle** fixed for all users
3. **Payment system** with Square, Stripe, PayPal, Zelle
4. **All UI fixes** and improvements

## 🔧 Manual Fix Instructions

### SSH into Coolify Server
```bash
ssh root@72.60.28.175
```

### Complete Cache Clear (RECOMMENDED)
```bash
# Navigate to app directory
cd /var/lib/coolify/applications/stepperslife

# Stop the application
docker-compose down

# Clear ALL caches
docker system prune -af
docker builder prune -af
rm -rf .next node_modules

# Force fresh pull
git fetch --all
git reset --hard origin/main
git pull origin main --force

# Rebuild from scratch
docker-compose build --no-cache --pull
docker-compose up -d
```

## ✅ Verification
Check: https://stepperslife.com/version
Should show: "version": "3.1.0"
