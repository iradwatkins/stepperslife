# Fix for Google OAuth Error 401: invalid_client

## Problem
Getting "Error 401: invalid_client - The OAuth client was not found" when trying to sign in with Google.

## Root Cause
1. Google OAuth credentials are not set in production environment
2. OR the credentials are incorrect/expired
3. OR the redirect URIs don't match

## Solution Steps

### 1. Create/Update Google OAuth Credentials

Go to Google Cloud Console:
https://console.cloud.google.com/apis/credentials

1. Select your project (or create one)
2. Click "CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: "Web application"
4. Name: "SteppersLife Production"
5. Authorized JavaScript origins:
   - https://stepperslife.com
   - https://www.stepperslife.com
6. Authorized redirect URIs:
   - https://stepperslife.com/api/auth/callback/google
   - https://www.stepperslife.com/api/auth/callback/google
7. Click "CREATE"
8. Copy the Client ID and Client Secret

### 2. Deploy to Production

SSH to server and run:
```bash
ssh root@72.60.28.175

# Set the credentials (replace with your actual values)
docker exec -it stepperslife-prod sh -c "
export GOOGLE_CLIENT_ID='your-client-id-here.apps.googleusercontent.com'
export GOOGLE_CLIENT_SECRET='your-client-secret-here'
"

# OR create environment file
cat > /opt/stepperslife/.env.google << 'EOF'
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
EOF

# Restart container with credentials
docker stop stepperslife-prod
docker run -d \
  --name stepperslife-prod \
  --restart unless-stopped \
  --network coolify \
  -p 3000:3000 \
  --env-file /opt/stepperslife/.env.google \
  -e NODE_ENV=production \
  -e NEXTAUTH_URL=https://stepperslife.com \
  -e NEXTAUTH_SECRET=YC4H/yZ0wC+1O9M7fQZeNauGk= \
  -e PLATFORM_FEE_PER_TICKET=1.50 \
  -e NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud \
  -e CONVEX_DEPLOYMENT=prod:mild-newt-621 \
  --label "traefik.enable=true" \
  --label "traefik.http.routers.stepperslife.rule=Host(\`stepperslife.com\`)" \
  --label "traefik.http.services.stepperslife.loadbalancer.server.port=3000" \
  stepperslife:v3.1.0
```

### 3. Verify Fix

```bash
# Check if Google is configured
curl https://stepperslife.com/api/auth/providers | jq '.providers.google'

# Should show:
{
  "id": "google",
  "name": "Google",
  "configured": true,
  "status": "ready"
}
```

## Common Issues

### Issue: Still getting invalid_client
- Double-check Client ID is correct (ends with .apps.googleusercontent.com)
- Ensure Client Secret has no extra spaces
- Verify redirect URIs match exactly (including https://)

### Issue: Redirect URI mismatch
- Must include: https://stepperslife.com/api/auth/callback/google
- Check for www vs non-www
- Ensure https:// not http://

### Issue: Application not verified
- For production, may need to verify domain ownership
- Add authorized domains in Google Console

## Testing
After deployment, test at:
https://stepperslife.com/auth/signin

Click "Continue with Google" - should redirect to Google sign-in.