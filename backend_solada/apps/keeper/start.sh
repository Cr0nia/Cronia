#!/bin/sh

echo "🔄 Ensuring Prisma Client is generated..."
npx prisma generate

echo "🚀 Starting Keeper in development mode..."
cd /app/apps/keeper && npm run dev
