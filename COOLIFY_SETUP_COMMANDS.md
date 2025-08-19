# COOLIFY SETUP - EXACT COMMANDS TO USE

## 1. Repository URL
```
https://github.com/iradwatkins/stepperslife.git
```

## 2. Branch
```
main
```

## 3. Build Configuration

### Base Directory
```
/
```

### Install Command
```bash
npm install --legacy-peer-deps
```

### Build Command  
```bash
npx convex deploy && npm run build
```

### Start Command
```bash
npm start
```

### Port
```
3000
```

## 4. Build Pack
Select: **Nixpacks** or **Node.js**

## 5. Environment Variables
Copy everything from `coolify-env.txt` file

## 6. IMPORTANT - Get Convex Deploy Key
1. Go to: https://dashboard.convex.dev
2. Login with your account
3. Select project: **mild-newt-621**
4. Click **Settings** → **Deploy Keys**
5. Create new deploy key or copy existing
6. Add to CONVEX_DEPLOY_KEY in environment variables

## 7. Health Check (Optional)
- Path: `/api/health`
- Method: GET
- Interval: 30 seconds

## 8. After Deploy - Verify
Check these URLs:
- Homepage: http://72.60.28.175:3004
- Sign In: http://72.60.28.175:3004/auth/signin
- Sign Up: http://72.60.28.175:3004/auth/signup

You should see:
✅ Green test banner at top
✅ "Welcome to SteppersLife" heading
✅ White sign-in form (not purple landing page)

## Troubleshooting Commands

### Check what's running (SSH into server):
```bash
docker ps | grep 3004
docker logs [container-id]
```

### Force rebuild in Coolify:
1. Click "Clear Build Cache"
2. Click "Redeploy"

### Check GitHub webhook:
Settings → Webhooks → Check if Coolify webhook exists