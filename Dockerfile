# Build stage
FROM node:20-alpine AS builder

# Force cache invalidation - Version 3.1.0
# Build timestamp: 2025-08-24T20:45:00Z
# Platform fee: $1.50 per ticket
ARG CACHE_BUST=1
ENV DEPLOYMENT_VERSION=3.1.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install --force

# Generate Prisma Client
RUN npx prisma generate

# Copy all files
COPY . .

# Build the application with version info
ENV NEXT_PUBLIC_BUILD_VERSION=3.1.0
ENV NEXT_PUBLIC_BUILD_TIME=2025-08-24T20:45:00Z
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install sqlite3 for Prisma
RUN apk add --no-cache sqlite

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma

# Create database directory
RUN mkdir -p /app/prisma && chown -R nextjs:nodejs /app/prisma

# Set user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Start script that initializes database and starts server
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Start the application
CMD ["./docker-entrypoint.sh"]