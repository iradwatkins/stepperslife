# Convex Database Setup Instructions

## Prerequisites
- Node.js installed
- npm or yarn package manager
- Convex account (free tier available)

## Step 1: Initialize Convex

Run the following command in a new terminal window:

```bash
npx convex dev
```

This will:
1. Prompt you to login to Convex (or create account)
2. Create a new project or select existing
3. Generate the Convex deployment URL
4. Start the Convex development server

## Step 2: Save the Generated URLs

After running `npx convex dev`, you'll see output like:
```
✔ Saved deployment URL to .env.local
  NEXT_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
  
✔ Convex functions ready
```

These URLs are automatically saved to your `.env.local` file.

## Step 3: Verify Schema Deployment

The Convex schema should automatically deploy with the following tables:
- `users` - User accounts with Square integration
- `events` - Event listings
- `tickets` - Purchased tickets
- `waitingList` - Waiting list entries
- `payments` - Square payment links for webhook processing

## Step 4: Test the Database Connection

1. Keep the Convex dev server running
2. In a new terminal, run:
   ```bash
   npm run dev
   ```
3. Visit http://localhost:3000
4. The app should now connect to Convex successfully

## Step 5: For Production Deployment

1. Run `npx convex deploy` to deploy to production
2. Copy the production URL to your Coolify environment variables
3. Set these environment variables in Coolify:
   - `NEXT_PUBLIC_CONVEX_URL` - The production Convex URL
   - `CONVEX_DEPLOYMENT` - The deployment name

## Troubleshooting

### "Cannot prompt for input in non-interactive terminals"
This error occurs when running in non-interactive environments. You must run `npx convex dev` in an interactive terminal.

### "Provided address was not an absolute URL"
This means the NEXT_PUBLIC_CONVEX_URL is missing. Run `npx convex dev` to generate it.

### Database schema not updating
1. Stop the Convex dev server (Ctrl+C)
2. Run `npx convex dev` again
3. The schema changes should deploy automatically

## Using Convex Dashboard

1. Visit https://dashboard.convex.dev
2. Login with your account
3. Select your project
4. You can:
   - View data in tables
   - Run functions manually
   - Monitor logs
   - Manage deployments

## Database is Ready!

Once Convex is initialized, your database will include:
- ✅ Payments table for Square webhook processing
- ✅ User authentication functions
- ✅ Ticket management functions
- ✅ Event management functions
- ✅ Waiting list functions

The application is configured to use **Convex** as the real-time serverless database for all data storage and retrieval.