#!/bin/sh

echo "🔄 Ensuring Prisma Client is generated..."
npx prisma generate

echo "🚀 Starting Indexer in development mode..."
cd /app/apps/indexer && npm run dev
