FROM node:20-alpine AS base

# Install dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma

# Copy Indexer package files
COPY apps/indexer/package*.json ./apps/indexer/
COPY apps/indexer/tsconfig.json ./apps/indexer/

# Install dependencies
RUN npm install

# Copy Indexer source
COPY apps/indexer ./apps/indexer

# Copy start script
COPY apps/indexer/start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Generate Prisma Client
RUN npx prisma generate

# Development stage
FROM base AS development
CMD ["/bin/sh", "/app/start.sh"]

# Production build
FROM base AS build
RUN cd apps/indexer && npm run build

# Production stage
FROM node:20-alpine AS production

# Install dependencies for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy necessary files
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/indexer/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/package*.json ./

# Generate Prisma Client for production
RUN npx prisma generate

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
