# Fix SteppersLife Authentication - Quick Commands

## What is NextAuth?
NextAuth (Auth.js) is the authentication system that replaced Clerk. It handles:
- Google sign-in
- Magic link emails
- Password login

## The Issue
The error "MissingCSRF" and "502 Bad Gateway" happens because NextAuth needs proper configuration for HTTPS.

## Quick Fix - Copy & Paste This

SSH into your server (72.60.28.175) and run this single command:

```bash
cd /opt/stepperslife && \
git pull origin main && \
npm install --legacy-peer-deps && \
echo -e "\nAUTH_TRUST_HOST=true\nNEXTAUTH_URL=https://stepperslife.com\nNEXTAUTH_URL_INTERNAL=http://localhost:3001\nNODE_ENV=production" >> .env.production && \
cp .env.production .env.local && \
npx prisma generate && \
npx prisma db push && \
npm run build && \
pm2 restart stepperslife && \
pm2 status stepperslife
```

This will:
1. Pull the latest code with fixes
2. Install dependencies including NextAuth
3. Add the required environment variables
4. Set up the database for storing sessions
5. Build the application
6. Restart it

## After Running
The site should work at https://stepperslife.com with:
- Google sign-in button (primary)
- Magic link email option
- Classic password login (in dropdown)

## If You Still Get Errors
Check the logs:
```bash
pm2 logs stepperslife --lines 50
```