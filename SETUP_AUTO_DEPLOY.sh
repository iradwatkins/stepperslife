#!/bin/bash

# Setup Automatic Deployment for SteppersLife
echo "🚀 Setting Up Automatic Deployment"
echo "=================================="
echo ""
echo "This will set up GitHub Actions to automatically deploy when you push to main."
echo ""

# Step 1: Add GitHub Secret
echo "📝 Step 1: Add Server Password to GitHub Secrets"
echo ""
echo "1. Go to: https://github.com/iradwatkins/stepperslife/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Name: SERVER_PASSWORD"
echo "4. Value: [Your server root password]"
echo ""
echo "Press Enter when you've added the secret..."
read

# Step 2: Commit the workflow
echo ""
echo "📦 Step 2: Committing deployment workflow..."
git add .github/workflows/deploy-production.yml
git commit -m "Add automatic production deployment workflow

- Deploys on every push to main
- Properly sets all environment variables
- Verifies deployment success
- No more manual SSH required!"
git push origin main

echo ""
echo "✅ Setup Complete!"
echo ""
echo "From now on:"
echo "- Every push to main will automatically deploy"
echo "- No need to SSH to the server"
echo "- Environment variables are properly configured"
echo "- Google OAuth will work correctly"
echo ""
echo "The first automatic deployment is happening now!"
echo "Check progress at: https://github.com/iradwatkins/stepperslife/actions"