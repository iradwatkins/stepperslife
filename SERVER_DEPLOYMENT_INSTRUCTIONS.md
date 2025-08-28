# SteppersLife Server Deployment Instructions

## 🚀 QUICK DEPLOYMENT (Copy & Paste)

SSH to server and run:

```bash
ssh root@72.60.28.175
```

Then execute:

```bash
cd /opt && rm -rf stepperslife && \
git clone https://github.com/iradwatkins/stepperslife.git && \
cd stepperslife && \
chmod +x DEPLOY_FINAL.sh && \
./DEPLOY_FINAL.sh
```

## 📋 What This Does

1. **Clears Port Conflicts** - Stops any containers using port 3000
2. **Builds Fresh** - Creates new Docker image with latest code
3. **Deploys Safely** - Runs container with proper configuration
4. **Verifies Everything** - Tests all endpoints and SSL certificates
5. **Shows Results** - Displays deployment summary

## 🔧 Troubleshooting

### If Port 3000 is Blocked:
```bash
cd /opt/stepperslife
chmod +x CLEAR_PORT_3000.sh
./CLEAR_PORT_3000.sh
```

### View Container Logs:
```bash
docker logs stepperslife-prod --tail 100
```

### Check Container Status:
```bash
docker ps | grep stepperslife
```

### Test Endpoints:
```bash
# Local test
curl http://localhost:3000/api/health

# Production test  
curl https://stepperslife.com/api/auth/providers
```

### SSL Certificate Issues:
```bash
# Check certificates
certbot certificates

# Renew if needed
certbot renew --force-renewal

# Install new certificate
certbot --nginx -d stepperslife.com --non-interactive --agree-tos --email admin@stepperslife.com
```

## ✅ Success Indicators

After deployment, you should see:

1. Container running: `stepperslife-prod`
2. Health endpoint returns: `{"status":"healthy"}`
3. Homepage shows SteppersLife content
4. Google OAuth is configured
5. HTTPS works without warnings

## 🌐 Test The Deployment

1. Visit https://stepperslife.com
2. Click "Sign In" 
3. Try Google authentication
4. Create a test event at `/seller/new-event`

## 📝 Notes

- The deployment takes 3-5 minutes
- Always clear browser cache after deployment (Cmd+Shift+R)
- The script handles all known edge cases automatically
- Logs are saved to `/opt/stepperslife/last_deployment.txt`