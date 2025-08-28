#!/bin/bash

# Script to prepare a clean repository for deployment
echo "🧹 Preparing Clean SteppersLife Repository"
echo "========================================="

CLEAN_DIR="../stepperslife-clean"
CURRENT_DIR=$(pwd)

# Create clean directory
rm -rf $CLEAN_DIR
mkdir -p $CLEAN_DIR

echo "📁 Copying application files..."

# Copy essential directories
cp -r app $CLEAN_DIR/
cp -r components $CLEAN_DIR/
cp -r convex $CLEAN_DIR/
cp -r prisma $CLEAN_DIR/
cp -r public $CLEAN_DIR/
cp -r styles $CLEAN_DIR/ 2>/dev/null || true
cp -r lib $CLEAN_DIR/ 2>/dev/null || true
cp -r hooks $CLEAN_DIR/ 2>/dev/null || true
cp -r types $CLEAN_DIR/ 2>/dev/null || true
cp -r docs $CLEAN_DIR/ 2>/dev/null || true

# Copy essential files
cp package.json $CLEAN_DIR/
cp package-lock.json $CLEAN_DIR/
cp tsconfig.json $CLEAN_DIR/
cp tailwind.config.ts $CLEAN_DIR/
cp postcss.config.* $CLEAN_DIR/ 2>/dev/null || true
cp next.config.* $CLEAN_DIR/ 2>/dev/null || true
cp .eslintrc.json $CLEAN_DIR/
cp README.md $CLEAN_DIR/ 2>/dev/null || true

# Copy Docker files (useful for some platforms)
cp Dockerfile $CLEAN_DIR/
cp docker-compose.yml $CLEAN_DIR/ 2>/dev/null || true

# Create essential deployment files
cd $CLEAN_DIR

# Create .npmrc for React 19 RC
echo "legacy-peer-deps=true" > .npmrc

# Create clean .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Database
prisma/*.db
prisma/*.db-journal

# IDE
.vscode/
.idea/
EOF

# Create environment template
cat > .env.example << 'EOF'
# App Configuration
NEXT_PUBLIC_APP_NAME=SteppersLife
NEXT_PUBLIC_APP_URL=https://yourdomain.com
PLATFORM_FEE_PER_TICKET=1.50

# Authentication (NextAuth.js)
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-convex-url
CONVEX_DEPLOYMENT=your-deployment-key

# Database
DATABASE_URL=file:./dev.db
EOF

# Create deployment README
cat > DEPLOYMENT.md << 'EOF'
# SteppersLife Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)
1. Fork this repository
2. Import to Vercel: https://vercel.com/new
3. Add environment variables from `.env.example`
4. Deploy!

### Option 2: Railway
1. Fork this repository
2. Create new project on Railway: https://railway.app
3. Deploy from GitHub
4. Add environment variables

### Option 3: Render
1. Fork this repository
2. Create Web Service on Render
3. Connect GitHub repository
4. Add environment variables

## 📋 Environment Variables

Copy `.env.example` and fill in your values:

- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `GOOGLE_CLIENT_ID/SECRET`: From Google Cloud Console
- `NEXT_PUBLIC_CONVEX_URL`: From Convex dashboard
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: From Google Cloud Console

## 🔧 Local Development

```bash
npm install
npm run dev
```

## 📦 Tech Stack

- Next.js 15 with App Router
- React 19 RC
- Convex for backend
- NextAuth.js for authentication
- Tailwind CSS for styling
- Prisma with SQLite
EOF

# Create package.json scripts for deployment
cd $CURRENT_DIR
node -e "
const pkg = require('./package.json');
delete pkg.scripts.bmad;
delete pkg.scripts['bmad:activate'];
delete pkg.scripts['bmad:analyst'];
delete pkg.scripts['bmad:ui'];
delete pkg.scripts['bmad:dev'];
delete pkg.scripts['bmad:qa'];
delete pkg.scripts['bmad:pm'];
delete pkg.scripts['bmad:architect'];
delete pkg.scripts['bmad:scrum'];
delete pkg.scripts['bmad:orchestrate'];
delete pkg.scripts['bmad:status'];
delete pkg.scripts['bmad:reset'];
delete pkg.scripts['bmad:install-tools'];
pkg.scripts.postinstall = 'prisma generate';
require('fs').writeFileSync('$CLEAN_DIR/package.json', JSON.stringify(pkg, null, 2));
"

cd $CLEAN_DIR

# Initialize git
git init
git add .
git commit -m "Initial commit - Clean SteppersLife repository"

echo ""
echo "✅ Clean repository prepared at: $CLEAN_DIR"
echo ""
echo "📋 Next Steps:"
echo "1. cd $CLEAN_DIR"
echo "2. Create new GitHub repository: stepperslife-v2"
echo "3. git remote add origin https://github.com/iradwatkins/stepperslife-v2.git"
echo "4. git push -u origin main"
echo "5. Deploy to Vercel/Railway/Render"
echo ""
echo "📌 Important files created:"
echo "- .env.example (environment template)"
echo "- DEPLOYMENT.md (deployment guide)"
echo "- .npmrc (React 19 RC fix)"
echo "- Clean .gitignore"