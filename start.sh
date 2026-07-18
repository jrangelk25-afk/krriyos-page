#!/bin/sh
set -e

echo "Starting application..."

# Run migrations if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL detected, running migrations..."
  pnpm prisma migrate deploy
else
  echo "DATABASE_URL not set, skipping migrations"
fi

# Start the server
exec tsx server.js
