#!/bin/bash

# Enable Square Payments Script
# Run this when you're ready to enable Square payment processing

echo "🔧 Enabling Square Payments..."

# Production server configuration
SERVER_IP="72.60.28.175"
SERVER_USER="root"
SERVER_PASSWORD="Bobby321&Gloria321Watkins?"

# Square configuration (update these with your actual credentials)
SQUARE_ACCESS_TOKEN="YOUR_SQUARE_ACCESS_TOKEN_HERE"
SQUARE_LOCATION_ID="YOUR_SQUARE_LOCATION_ID_HERE"
SQUARE_APPLICATION_ID="YOUR_SQUARE_APPLICATION_ID_HERE"
SQUARE_WEBHOOK_SIGNATURE_KEY="YOUR_WEBHOOK_SIGNATURE_KEY_HERE"

# Update production environment
sshpass -p "$SERVER_PASSWORD" ssh $SERVER_USER@$SERVER_IP << EOF
  # Update environment file
  cd /opt/stepperslife
  
  # Enable Square
  sed -i 's/DISABLE_SQUARE=true/DISABLE_SQUARE=false/' .env.production
  
  # Add Square credentials (uncomment and update when you have them)
  # echo "SQUARE_ACCESS_TOKEN=$SQUARE_ACCESS_TOKEN" >> .env.production
  # echo "SQUARE_LOCATION_ID=$SQUARE_LOCATION_ID" >> .env.production  
  # echo "SQUARE_APPLICATION_ID=$SQUARE_APPLICATION_ID" >> .env.production
  # echo "SQUARE_WEBHOOK_SIGNATURE_KEY=$SQUARE_WEBHOOK_SIGNATURE_KEY" >> .env.production
  
  # Restart container
  docker restart stepperslife-prod
  
  echo "✅ Square payments enabled!"
EOF

echo "📝 Note: Remember to update the Square credentials in this script before running!"