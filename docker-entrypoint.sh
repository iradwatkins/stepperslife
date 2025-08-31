#!/bin/sh

# Start the application
echo "Starting SteppersLife application..."
export HOSTNAME=0.0.0.0
exec node server.js