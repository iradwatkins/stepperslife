#!/bin/bash

# Script to push all current code to GitHub
echo "🚀 Pushing SteppersLife to GitHub"
echo "================================="

# Check current status
echo "📊 Current Status:"
git status --short
echo ""

# Add all files
echo "📦 Adding all files..."
git add -A

# Commit with timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "💾 Committing changes..."
git commit -m "Full deployment update - $TIMESTAMP

- All application code
- Environment configurations
- GitHub Actions workflow
- Ready for production deployment"

# Push to GitHub
echo ""
echo "🔧 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Check: https://github.com/iradwatkins/stepperslife"
echo ""
echo "📋 Next steps:"
echo "1. GitHub Actions will automatically deploy"
echo "2. Check Actions tab for deployment progress"
echo "3. Site will be live in ~10 minutes"