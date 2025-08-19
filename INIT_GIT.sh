#!/bin/bash

echo "Initializing Git repository for SteppersLife..."

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit - SteppersLife clean codebase

- Complete working code without test banners
- EventsDisplay component with 4 view modes
- Payment integration (Square, PayPal, Cash App)
- Google Maps integration
- Force-dynamic rendering to prevent caching
- Ready for deployment"

# Add remote (update with your repo)
echo ""
echo "To connect to GitHub:"
echo "1. Create a new repository on GitHub"
echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/stepperslife-new.git"
echo "3. Run: git push -u origin main"
echo ""
echo "Repository initialized successfully!"