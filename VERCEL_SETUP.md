# Vercel Deployment Setup

## ✅ What I've Done

1. **Fixed React dependency conflicts** - Added `.npmrc` with `legacy-peer-deps=true`
2. **Created vercel.json** - Proper build configuration
3. **Cleaned repository** - Moved 25+ old deployment scripts to archive/

## 🔑 Environment Variables to Add in Vercel Dashboard

Go to your Vercel project settings and add these environment variables:

### Required Variables:
```
NEXTAUTH_SECRET=MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
GOOGLE_CLIENT_ID=1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
```

### Optional Variables (if using):
```
SQUARE_ACCESS_TOKEN=(if using Square)
SQUARE_APPLICATION_ID=(if using Square)
SQUARE_LOCATION_ID=(if using Square)
```

## 🚀 Next Steps

1. Check Vercel deployment: https://vercel.com/dashboard
2. Add the environment variables above
3. Redeploy if needed
4. Update DNS to point to Vercel

## 🎯 Result

- Every `git push` to main = automatic deployment
- No more SSH, Docker, or manual commands
- Preview deployments for every PR
- Instant rollbacks in dashboard