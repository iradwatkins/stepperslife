# 🚀 Deploy Convex Database - Quick Start

## Option 1: Quick Deploy (Recommended)
**Open a new terminal window** and run:

```bash
cd "/Users/irawatkins/Documents/Coolify Managment Folder/stepperslife"
./deploy-convex.sh
```

This will:
1. Prompt you to login to Convex (or create free account)
2. Create a new project called "stepperslife"
3. Deploy your database schema
4. Save the URLs to .env.local automatically

## Option 2: Manual Steps
If the script doesn't work, run these commands manually:

```bash
# 1. Navigate to project
cd "/Users/irawatkins/Documents/Coolify Managment Folder/stepperslife"

# 2. Clear any existing deployment
unset CONVEX_DEPLOYMENT

# 3. Run Convex dev
npx convex dev
```

### What will happen:
1. **Browser opens** → Login or create account at Convex
2. **Choose project** → Create new project "stepperslife" 
3. **Deployment starts** → Your schema deploys automatically
4. **URLs generated** → Saved to your .env.local file

## Option 3: Try Without Account (Limited)
```bash
# Clear the deployment variable first
export CONVEX_DEPLOYMENT=""
npx convex dev
```
Then choose "Try Convex without an account" option.

## After Deployment Succeeds

Your `.env.local` will be updated with:
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment-id
```

## Test Your Deployment

```bash
# Start the development server
npm run dev
```

Visit http://localhost:3000 - Your app should now work!

## Important Notes
- **You MUST run this in your terminal**, not through me
- Convex needs to interact with you directly
- The free tier is sufficient for testing
- Keep the terminal open while developing

## Need Help?
If you see errors:
1. Make sure you're in the project directory
2. Try `npm install convex --save-dev` first
3. Use Option 2 (manual steps) if the script fails