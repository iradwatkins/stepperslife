#!/bin/bash

# Direct deployment execution
echo "🚀 Executing deployment to SteppersLife production..."
echo ""
echo "This will:"
echo "1. SSH to server 72.60.28.175"
echo "2. Build and deploy with all environment variables"
echo "3. Enable Google OAuth authentication"
echo ""
echo "Deployment takes 5-10 minutes..."
echo ""
echo "When prompted for password, enter: Bobby321&Gloria321Watkins"
echo ""
echo "Press Enter to start deployment..."
read

# SSH and deploy
ssh root@72.60.28.175 'cd /opt && rm -rf stepperslife && git clone https://github.com/iradwatkins/stepperslife.git && cd stepperslife && chmod +x DEPLOY_FINAL.sh && ./DEPLOY_FINAL.sh'