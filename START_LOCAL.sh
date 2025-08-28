#!/bin/bash

echo "🚀 Starting SteppersLife Local Development Server"
echo "==============================================="
echo ""
echo "Starting on port 3001..."
echo ""

# Kill any existing process on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Start the development server
cd /Users/irawatkins/Documents/stepperslife
npm run dev

# The server will be available at:
# http://localhost:3001