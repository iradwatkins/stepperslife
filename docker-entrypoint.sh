#!/bin/sh

# Initialize Prisma database if it doesn't exist
if [ ! -f /app/prisma/dev.db ]; then
  echo "Initializing Prisma database..."
  npx prisma db push --skip-generate
  echo "Database initialized successfully"
else
  echo "Database already exists"
fi

# Start the application
echo "Starting SteppersLife application..."
exec node server.js