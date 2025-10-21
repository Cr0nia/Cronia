#!/bin/bash

echo "🚀 Cronia Backend Setup"
echo "======================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ .env created. Please edit it with your configuration."
  echo ""
else
  echo "✅ .env file already exists"
  echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Start Docker containers
echo "🐳 Starting Docker containers (Postgres + Redis)..."
npm run docker:up
echo ""

# Wait for Postgres to be ready
echo "⏳ Waiting for Postgres to be ready..."
sleep 5
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate
echo ""

# Run migrations
echo "📊 Running database migrations..."
npm run prisma:migrate
echo ""

# Seed database
echo "🌱 Seeding database with test data..."
npm run prisma:seed
echo ""

echo "✅ Setup completed successfully!"
echo ""
echo "📚 Next steps:"
echo "  1. Edit .env file with your configuration"
echo "  2. Start the API: npm run api:dev"
echo "  3. Start the Keeper: npm run keeper:dev"
echo "  4. Start the Indexer: npm run indexer:dev"
echo "  5. Or start all: npm run dev:all"
echo ""
echo "📖 API Documentation: http://localhost:3000/docs"
echo "🏥 Health Check: http://localhost:3000/v1/health"
echo ""
