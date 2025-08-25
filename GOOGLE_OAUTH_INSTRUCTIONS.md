# Google OAuth Setup Instructions for SteppersLife

## Quick Fix for Error 401: invalid_client

### Step 1: Create Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Configure as follows:

**Application type:** Web application  
**Name:** SteppersLife Production

**Authorized JavaScript origins:**
```
https://stepperslife.com
https://www.stepperslife.com
```

**Authorized redirect URIs:** (MUST be exactly these)
```
https://stepperslife.com/api/auth/callback/google
https://www.stepperslife.com/api/auth/callback/google
```

4. Click **CREATE**
5. Copy the **Client ID** and **Client Secret**

### Step 2: Deploy Credentials to Production

Run this command on your server:

```bash
ssh root@72.60.28.175

# Create environment file with your credentials
cat > /opt/google-oauth.env << 'EOF'
# Replace these with your actual credentials
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE

# Keep these as-is
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=YC4H/yZ0wC+1O9M7fQZeNauGk=
NODE_ENV=production
PLATFORM_FEE_PER_TICKET=1.50
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
CONVEX_DEPLOYMENT=prod:mild-newt-621
EOF

# Stop and remove old container
docker stop stepperslife-prod
docker rm stepperslife-prod

# Start with Google OAuth configured
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network coolify \
  -p 3000:3000 \
  --env-file /opt/google-oauth.env \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  stepperslife:v3.1.0

# Verify it's working
sleep 5
curl http://localhost:3000/api/auth/providers | grep google
```

### Step 3: Test Google Sign-In

1. Go to: https://stepperslife.com/auth/signin
2. Click "Continue with Google"
3. Should redirect to Google sign-in page

## Troubleshooting

### If you still get "invalid_client":
- Make sure Client ID ends with `.apps.googleusercontent.com`
- Check for extra spaces in credentials
- Verify redirect URIs match EXACTLY (including https://)
- Client ID and Secret are from the same OAuth 2.0 client

### If you get "redirect_uri_mismatch":
- The redirect URI MUST be: `https://stepperslife.com/api/auth/callback/google`
- Add both www and non-www versions
- Make sure it's https:// not http://

### To verify credentials are set:
```bash
docker exec stepperslife-prod env | grep GOOGLE
```

Should show your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

## Alternative: Use Environment Variables Directly

If the env file doesn't work, try passing directly:

```bash
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network coolify \
  -p 3000:3000 \
  -e GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com" \
  -e GOOGLE_CLIENT_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://stepperslife.com" \
  -e NEXTAUTH_SECRET="YC4H/yZ0wC+1O9M7fQZeNauGk=" \
  -e NODE_ENV="production" \
  -e PLATFORM_FEE_PER_TICKET="1.50" \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`)" \
  stepperslife:v3.1.0
```

## Success Indicators

When properly configured:
```bash
curl https://stepperslife.com/api/auth/providers | jq '.providers.google'
```

Should return:
```json
{
  "id": "google",
  "name": "Google",
  "type": "oauth",
  "configured": true,
  "clientId": "configured",
  "status": "ready"
}
```

---

**Note**: The error "401: invalid_client" specifically means Google cannot find an OAuth client with the provided Client ID. This is always a credential configuration issue.