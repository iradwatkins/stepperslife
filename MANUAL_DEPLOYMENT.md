# SteppersLife Manual Deployment Guide

## Quick Deployment (Bypass Coolify)

### Option 1: Using Standalone Script (Easiest)

```bash
# SSH to server
ssh root@72.60.28.175

# Download and run deployment script
curl -O https://raw.githubusercontent.com/iradwatkins/stepperslife/main/deploy-standalone.sh
chmod +x deploy-standalone.sh
./deploy-standalone.sh
```

### Option 2: Direct Docker Commands

```bash
# SSH to server
ssh root@72.60.28.175

# Clone repository
cd /opt
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife

# Build and run
docker build --no-cache -t stepperslife:v3.1.0 .
docker run -d --name stepperslife-prod -p 3000:3000 stepperslife:v3.1.0
```

## Verification

```bash
curl https://stepperslife.com/version
# Should show version 3.1.0
```
