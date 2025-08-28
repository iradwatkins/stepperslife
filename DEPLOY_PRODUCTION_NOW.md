# 🚨 URGENT: Production Deployment Commands

## Current Status
- **Local**: ✅ Running on http://localhost:3001
- **Production**: ❌ 502 Bad Gateway (no container running)
- **Issue**: Docker image tag mismatch and network issues

## COPY & PASTE THESE COMMANDS TO DEPLOY

### 1. SSH to Server
```bash
ssh root@72.60.28.175
```
Password: `Bobby321&Gloria321Watkins?`

### 2. Build and Deploy (Run these commands on server)
```bash
cd /opt/stepperslife
git pull origin main

# Build the image
docker build --no-cache -t stepperslife:latest .

# Stop any existing containers
docker stop stepperslife-prod 2>/dev/null || true
docker rm stepperslife-prod 2>/dev/null || true

# Run the container (using bridge network for now)
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PLATFORM_FEE_PER_TICKET=1.50 \
  -e NEXTAUTH_URL=https://stepperslife.com \
  -e NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc= \
  -e GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com \
  -e GOOGLE_CLIENT_SECRET=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 \
  -e NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud \
  -e CONVEX_DEPLOYMENT=prod:mild-newt-621 \
  -e NEXT_PUBLIC_APP_URL=https://stepperslife.com \
  -e NEXT_PUBLIC_APP_NAME=SteppersLife \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE \
  -e DATABASE_URL="file:./dev.db" \
  stepperslife:latest

# Check if it's running
docker ps | grep stepperslife
docker logs stepperslife-prod --tail 20
```

### 3. Configure Traefik (if needed)
```bash
# Add labels to route traffic
docker stop stepperslife-prod
docker rm stepperslife-prod
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network dokploy-network \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PLATFORM_FEE_PER_TICKET=1.50 \
  -e NEXTAUTH_URL=https://stepperslife.com \
  -e NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc= \
  -e GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com \
  -e GOOGLE_CLIENT_SECRET=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 \
  -e NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud \
  -e CONVEX_DEPLOYMENT=prod:mild-newt-621 \
  -e NEXT_PUBLIC_APP_URL=https://stepperslife.com \
  -e NEXT_PUBLIC_APP_NAME=SteppersLife \
  -e NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE \
  -e DATABASE_URL="file:./dev.db" \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`) || Host(\`www.stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  stepperslife:latest
```

### 4. Verify Deployment
```bash
curl http://localhost:3000/version
curl https://stepperslife.com
```

## Local Google OAuth Fix

For localhost, you need to add this to Google Cloud Console:
- Authorized redirect URI: `http://localhost:3001/api/auth/callback/google`

Current status shows Google is configured but may need the localhost callback URL added.