# Coolify Deployment Fix Guide

## Issue: Wrong Application Running
The deployed site shows a completely different landing page instead of our SteppersLife application.

## Current Situation
- **Expected**: SteppersLife ticket platform with white signin form
- **Actual**: Purple gradient landing page with different branding
- **Coolify URL**: http://72.60.28.175:3000
- **App URL**: http://72.60.28.175:3004

## Step-by-Step Fix Process

### Step 1: Verify Coolify Configuration
```bash
# Log into Coolify
http://72.60.28.175:3000

# Check these settings:
1. GitHub Repository: https://github.com/iradwatkins/stepperslife
2. Branch: main
3. Build Commands: npm install --legacy-peer-deps && npx convex deploy && npm run build
4. Start Command: npm start
5. Port: 3000
```

### Step 2: Environment Variables to Set in Coolify
```env
# NextAuth
NEXTAUTH_URL=http://72.60.28.175:3004
NEXTAUTH_SECRET=your-secret-here
AUTH_URL=http://72.60.28.175:3004

# Convex
NEXT_PUBLIC_CONVEX_URL=https://marvelous-seagull-621.convex.cloud
CONVEX_DEPLOY_KEY=your-deploy-key

# Square
NEXT_PUBLIC_SQUARE_APP_ID=sandbox-sq0idb-lDOb01gEPAIRUDv1iGi2MA
NEXT_PUBLIC_SQUARE_LOCATION_ID=LM1QSA6YG6BYR
SQUARE_ACCESS_TOKEN=your-token
SQUARE_WEBHOOK_SIGNATURE_KEY=your-webhook-key
SQUARE_ENVIRONMENT=sandbox

# OAuth Providers
AUTH_GOOGLE_ID=your-google-id
AUTH_GOOGLE_SECRET=your-google-secret
AUTH_GITHUB_ID=your-github-id
AUTH_GITHUB_SECRET=your-github-secret
```

### Step 3: Delete and Recreate Application

1. **Delete Current Application**:
   - Go to Applications in Coolify
   - Find the current deployment
   - Click Delete/Remove
   - Confirm deletion

2. **Create New Application**:
   - Click "New Application"
   - Select "GitHub"
   - Authenticate if needed
   - Select repository: `iradwatkins/stepperslife`
   - Select branch: `main`

3. **Configure Build Settings**:
   ```yaml
   Build Command: npm install --legacy-peer-deps && npx convex deploy && npm run build
   Start Command: npm start
   Port: 3000
   Base Directory: /
   Publish Directory: .next
   ```

4. **Set All Environment Variables** (from Step 2)

5. **Deploy**:
   - Click "Deploy"
   - Monitor logs for errors

### Step 4: Verify Deployment

Check these pages after deployment:
- `/` - Should show event listing
- `/auth/signin` - Should show white card with form
- `/auth/signup` - Should show registration form
- `/seller` - Should show seller dashboard

### Step 5: If Still Wrong Application

This means Coolify is caching or using wrong source:

1. **SSH into server**:
   ```bash
   ssh root@72.60.28.175
   ```

2. **Find and remove old containers**:
   ```bash
   docker ps -a | grep 3004
   docker stop [container-id]
   docker rm [container-id]
   ```

3. **Clear Docker cache**:
   ```bash
   docker system prune -a
   ```

4. **Redeploy from Coolify**

### Step 6: Alternative Manual Deployment

If Coolify continues showing wrong app:

```bash
# SSH into server
ssh root@72.60.28.175

# Clone correct repository
cd /opt
rm -rf stepperslife
git clone https://github.com/iradwatkins/stepperslife.git
cd stepperslife

# Create .env.production
cat > .env.production << EOF
[paste all environment variables]
EOF

# Build and run
npm install --legacy-peer-deps
npx convex deploy
npm run build
npm start
```

## Verification Checklist

- [ ] Correct repository linked in Coolify
- [ ] All environment variables set
- [ ] Build completes without errors
- [ ] Convex deploys successfully
- [ ] Signin page shows white form (not purple landing)
- [ ] OAuth buttons visible
- [ ] No "Afterpay" in payment methods
- [ ] Database connections work

## What Our App Should Look Like

### Signin Page (`/auth/signin`)
- White card centered on page
- Purple-blue gradient background
- Email input field
- Password input field
- "Sign In" blue button
- Google OAuth button (with Google logo)
- GitHub OAuth button
- "Don't have an account? Sign up" link

### NOT This:
- Purple gradient landing page
- "Premium Event Ticketing Made Simple" tagline
- Marketing grid layout
- Platform features section

## Emergency Contacts
- Repository: https://github.com/iradwatkins/stepperslife
- Coolify: http://72.60.28.175:3000
- App (when fixed): http://72.60.28.175:3004