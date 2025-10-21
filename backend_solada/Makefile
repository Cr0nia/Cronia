.PHONY: help setup install dev api keeper indexer docker-up docker-down docker-logs prisma-migrate prisma-seed prisma-studio clean

help:
	@echo "Cronia Backend - Available commands:"
	@echo ""
	@echo "  make setup         - Full setup (install + docker + migrate + seed)"
	@echo "  make install       - Install dependencies"
	@echo "  make dev           - Start all services (API + Keeper + Indexer)"
	@echo "  make api           - Start API only"
	@echo "  make keeper        - Start Keeper only"
	@echo "  make indexer       - Start Indexer only"
	@echo "  make docker-up     - Start Docker containers"
	@echo "  make docker-down   - Stop Docker containers"
	@echo "  make docker-logs   - Show Docker logs"
	@echo "  make prisma-migrate - Run Prisma migrations"
	@echo "  make prisma-seed   - Seed database"
	@echo "  make prisma-studio - Open Prisma Studio"
	@echo "  make clean         - Clean build artifacts"
	@echo ""

setup:
	@chmod +x scripts/setup.sh
	@./scripts/setup.sh

install:
	npm install

dev:
	npm run dev:all

api:
	npm run api:dev

keeper:
	npm run keeper:dev

indexer:
	npm run indexer:dev

docker-up:
	npm run docker:up

docker-down:
	npm run docker:down

docker-logs:
	npm run docker:logs

prisma-migrate:
	npm run prisma:migrate

prisma-seed:
	npm run prisma:seed

prisma-studio:
	npx prisma studio

clean:
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf apps/*/dist
	rm -rf dist
	rm -rf .next
