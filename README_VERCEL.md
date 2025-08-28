# SteppersLife on Vercel

## ✅ Current Status
- Repository configured for Vercel deployment
- React 19 RC dependency conflicts fixed
- All deployment scripts archived
- Google Sign-In implemented

## 🚀 Deployment Instructions

### 1. Connect to Vercel
- Import project from GitHub: `iradwatkins/stepperslife`
- Framework preset: Next.js (auto-detected)

### 2. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
```

### 3. Deploy
- First deploy: Vercel will build automatically
- Future deploys: `git push origin main`

### 4. Update DNS
Point `stepperslife.com` to Vercel:
- Type: CNAME
- Name: @
- Value: cname.vercel-dns.com

## 📁 Project Structure
```
stepperslife/
├── app/              # Next.js 15 app directory
├── components/       # React components
├── convex/          # Convex backend
├── prisma/          # Database schema
├── public/          # Static assets
├── .npmrc           # NPM config (fixes React 19 RC)
├── vercel.json      # Vercel configuration
└── package.json     # Dependencies
```

## 🔧 Key Features
- Google OAuth authentication
- Convex real-time backend
- Event ticketing system
- Multi-day event support
- QR code tickets
- Mobile-responsive design

## 🌐 After Deployment
1. Test Google Sign-In at `/auth/signin`
2. Create test event at `/seller/new-event`
3. Verify tickets work at `/test-ticket-system`

## 📝 Notes
- Database: SQLite (file-based)
- Auth: NextAuth.js v5 with Google OAuth
- Backend: Convex
- Styling: Tailwind CSS
- Platform fee: $1.50 per ticket