# IMPORTANT: Add These Environment Variables to Vercel

While the build is running, add these environment variables in your Vercel project settings:

## Go to: Vercel Dashboard → Project Settings → Environment Variables

Add each of these:

### 1. NEXTAUTH_SECRET
```
MNPqnyyK7CDiaLwgHQEj+cpt0miM03ff0ECPxl5VKdc=
```

### 2. GOOGLE_CLIENT_ID
```
1009301533734-s9lbcqhrhehvtmd2bbrpkuvf4oo7ov3v.apps.googleusercontent.com
```

### 3. GOOGLE_CLIENT_SECRET
```
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
```

### 4. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```
AIzaSyAD1jQHxD0Y7TfZzv8D8V7o7DfwB7CjJxE
```

## After Adding Variables:
1. Click "Save"
2. Redeploy from Vercel dashboard
3. The site will then have working Google authentication!

## Note:
Without these variables, the build will succeed but Google Sign-In won't work.