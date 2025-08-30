# Build stage
FROM node:20-alpine AS builder

# Force cache invalidation - Version 4.0.0-clerk
# Build timestamp: 2025-08-30T12:00:00Z
# Authentication: Clerk
ARG CACHE_BUST=2
ENV DEPLOYMENT_VERSION=4.0.0-clerk

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy all files
COPY . .

# Build the application with version info
ENV NEXT_PUBLIC_BUILD_VERSION=4.0.0-clerk
ENV NEXT_PUBLIC_BUILD_TIME=2025-08-30T12:00:00Z
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy necessary files from builder in the correct order
# First copy the standalone build
COPY --from=builder /app/.next/standalone ./
# Then copy static files
COPY --from=builder /app/.next/static ./.next/static
# Finally copy public folder
COPY --from=builder /app/public ./public

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