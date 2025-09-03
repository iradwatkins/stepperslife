#!/bin/sh

# Start the application with PM2
echo "Starting SteppersLife application with PM2..."
export HOSTNAME=0.0.0.0

# Start PM2 in non-daemon mode (foreground)
exec pm2-runtime start ecosystem.config.js