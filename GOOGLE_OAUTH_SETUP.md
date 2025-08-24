# 🔐 Google OAuth Setup Guide for SteppersLife

## Error: "The OAuth client was not found" - Error 401: invalid_client

This error occurs because the Google OAuth credentials are not configured on the server.

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Select **Web application**
6. Configure:
   - **Name**: SteppersLife Production
   - **Authorized JavaScript origins**:
     ```
     https://stepperslife.com
     https://www.stepperslife.com
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     https://stepperslife.com/api/auth/callback/google
     https://www.stepperslife.com/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```
7. Click **CREATE**
8. Copy the **Client ID** and **Client Secret**

## Step 2: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Configure:
   - **App name**: SteppersLife
   - **User support email**: Your email
   - **Authorized domains**: stepperslife.com
   - **Developer contact**: Your email
3. Add scopes:
   - `openid`
   - `email`
   - `profile`
4. Save and continue

## Step 3: Create .env File on Server

SSH into your server and create the environment file:

```bash
ssh root@72.60.28.175
cd /root/stepperslife-latest

# Create .env file
cat > .env << 'EOF'
# Auth.js Configuration
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=YOUR_SECRET_HERE

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Square Configuration
SQUARE_ACCESS_TOKEN=YOUR_SQUARE_TOKEN
SQUARE_LOCATION_ID=YOUR_LOCATION_ID
SQUARE_APPLICATION_ID=YOUR_APP_ID
SQUARE_WEBHOOK_SIGNATURE_KEY=YOUR_WEBHOOK_KEY

# Convex Configuration
CONVEX_DEPLOYMENT=prod:mild-newt-621
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud

# Application
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
EOF
```

## Step 4: Generate NEXTAUTH_SECRET

```bash
# Generate a secure secret
openssl rand -base64 32
```

Copy the output and replace `YOUR_SECRET_HERE` in the .env file.

## Step 5: Update Environment Variables

Edit the .env file with your actual credentials:

```bash
nano .env
```

Replace:
- `YOUR_SECRET_HERE` with the generated secret
- `YOUR_GOOGLE_CLIENT_ID_HERE` with your Google Client ID
- `YOUR_GOOGLE_CLIENT_SECRET_HERE` with your Google Client Secret
- Square and Convex credentials with actual values

## Step 6: Restart the Application

```bash
# For Docker container
docker restart stepperslife-latest

# For PM2
pm2 restart stepperslife
```

## Step 7: Test OAuth

1. Visit https://stepperslife.com/auth/signin
2. Click "Sign in with Google"
3. Should redirect to Google sign-in
4. After authorization, should redirect back to SteppersLife

## Troubleshooting

### If still getting errors:

1. **Check logs**:
   ```bash
   docker logs stepperslife-latest --tail 50
   # or
   pm2 logs stepperslife --lines 50
   ```

2. **Verify environment variables are loaded**:
   ```bash
   docker exec stepperslife-latest env | grep GOOGLE
   ```

3. **Common issues**:
   - Wrong redirect URI (must match exactly)
   - OAuth consent screen not configured
   - Application not in production mode in Google Console
   - Environment variables not loaded properly

4. **Enable Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Enable it

## Security Notes

- Never commit .env files to Git
- Use strong NEXTAUTH_SECRET (32+ characters)
- Restrict OAuth origins to production domains only
- Regularly rotate secrets

## Quick Setup Script

Save this script as `setup-oauth.sh`:

```bash
#!/bin/bash

echo "Setting up Google OAuth for SteppersLife..."

# Generate secret
SECRET=$(openssl rand -base64 32)

echo "Generated NEXTAUTH_SECRET: $SECRET"
echo ""
echo "Please enter your Google OAuth credentials:"
read -p "Google Client ID: " GOOGLE_ID
read -p "Google Client Secret: " GOOGLE_SECRET

cat > .env << EOF
NEXTAUTH_URL=https://stepperslife.com
NEXTAUTH_SECRET=$SECRET
GOOGLE_CLIENT_ID=$GOOGLE_ID
GOOGLE_CLIENT_SECRET=$GOOGLE_SECRET
CONVEX_DEPLOYMENT=prod:mild-newt-621
NEXT_PUBLIC_CONVEX_URL=https://mild-newt-621.convex.cloud
NEXT_PUBLIC_APP_URL=https://stepperslife.com
NEXT_PUBLIC_APP_NAME=SteppersLife
EOF

echo "Environment file created!"
echo "Restarting application..."
docker restart stepperslife-latest

echo "Setup complete! Test at https://stepperslife.com/auth/signin"
```

Run with: `bash setup-oauth.sh`