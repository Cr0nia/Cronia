#!/bin/sh

echo "🔄 Running Prisma migrations..."
cd /app && npx prisma migrate deploy

echo "🚀 Starting API in development mode..."
cd /app/apps/api && npm run dev:watch
