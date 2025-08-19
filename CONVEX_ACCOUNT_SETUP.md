# 🚀 Convex Account Setup - The Proper Way

## Step 1: Create Your Convex Account
1. Go to: https://www.convex.dev/
2. Click "Start Building" or "Sign Up"
3. Create your account (free tier is perfect for this project)

## Step 2: Run Convex Setup in Your Terminal

Open **Terminal** on your Mac and run these commands:

```bash
# Navigate to your project
cd "/Users/irawatkins/Documents/Coolify Managment Folder/stepperslife"

# Start Convex setup
npx convex dev
```

## Step 3: Follow the Prompts

### Prompt 1: "Welcome to Convex! Would you like to login to your account?"
- Use arrow keys to select: **"Login or create an account"**
- Press Enter

### Prompt 2: Device Authentication
- It will open your browser
- Login with your Convex account
- Authorize the device

### Prompt 3: "Select or create a project"
- Choose: **"Create a new project"**
- Project name: `stepperslife`

### Prompt 4: "Select environment"
- Choose: **"Development"**

## Step 4: Automatic Configuration

Convex will automatically:
✅ Deploy your schema (users, events, tickets, payments tables)
✅ Generate your project URLs
✅ Update your `.env.local` file with:
```
NEXT_PUBLIC_CONVEX_URL=https://[your-project].convex.cloud
CONVEX_DEPLOYMENT=dev:[your-deployment-id]
```
✅ Start watching for file changes

## Step 5: Get Your Deploy Key (For Automated Deployments)

Once logged in, get a deploy key for CI/CD:

1. Go to: https://dashboard.convex.dev
2. Select your `stepperslife` project
3. Go to Settings → Deploy Keys
4. Create a new deploy key
5. Save it for Coolify deployment:
```bash
CONVEX_DEPLOY_KEY=prod:[your-key-here]
```

## Step 6: Deploy to Production

For production deployment on Coolify:
```bash
# With deploy key set as environment variable
npx convex deploy
```

## What You Get With an Account:

### Free Tier Includes:
- ✅ **Unlimited development deployments**
- ✅ **1 million function calls/month**
- ✅ **1 GB database storage**
- ✅ **1 GB file storage**
- ✅ **Real-time sync**
- ✅ **Dashboard access**
- ✅ **Logs and monitoring**

### Benefits Over Anonymous Mode:
- 📊 **Dashboard** - View/edit data, monitor functions
- 🔐 **Deploy keys** - Automated CI/CD deployments
- 📝 **Logs** - Debug and monitor your functions
- 🚀 **Production deployments** - Not just local
- 💾 **Data persistence** - Your data is saved
- 🔄 **Multiple environments** - Dev, staging, production

## Your Current Schema Ready to Deploy:

### Tables:
- `users` - With Google OAuth support
- `events` - Event listings
- `tickets` - Ticket purchases  
- `waitingList` - Event waiting lists
- `payments` - Square payment tracking

### Functions:
- User authentication (getUserByEmail, createUser)
- Payment processing (storeSquarePaymentLink)
- Ticket management (markAsRefunded, getTicketById)
- Event management (all CRUD operations)

## After Setup Is Complete:

1. **Test locally:**
```bash
npm run dev
# Visit http://localhost:3000
```

2. **Your app will have:**
- ✅ Google OAuth login working
- ✅ Real-time database connected
- ✅ All functions operational
- ✅ Ready for Square integration

3. **For Coolify deployment**, add these to environment:
```
CONVEX_DEPLOY_KEY=prod:[your-deploy-key]
GOOGLE_CLIENT_ID=[YOUR_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[YOUR_GOOGLE_CLIENT_SECRET]
```

## Ready to Start?

Run this command now in your Terminal:
```bash
cd "/Users/irawatkins/Documents/Coolify Managment Folder/stepperslife" && npx convex dev
```

The whole process takes about 2-3 minutes!