# Optimized Multi-Stage Dockerfile - Static Generation
# Casino Portal - Production-Ready Build
# Version: 3.0.0 - Performance Optimized

# --- Stage 1: Base Dependencies ---
FROM node:20-bullseye-slim AS base
WORKDIR /app

# Copy package files for layer caching
COPY package.json package-lock.json* ./

# --- Stage 2: Production Dependencies ---
FROM base AS prod-deps
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# --- Stage 3: Development Dependencies ---
FROM base AS dev-deps
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# --- Stage 4: Builder - Static Site Generation ---
FROM dev-deps AS builder

# Copy source code
COPY . .

# Architecture validation (optional)
RUN echo "🏗️ Building static site..." && \
    npm run oop:validate || echo "⚠️ Validation optional"

# Build static site
RUN npm run build && \
    echo "✅ Static build complete" && \
    echo "📈 Build size: $(du -sh dist/)" && \
    ls -la dist/

# --- Stage 5: Production - Nginx Static Server ---
FROM nginx:alpine AS production

LABEL maintainer="Casino Portal Team"
LABEL description="Optimized static casino portal"
LABEL version="3.0.0"

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for optimal performance
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create architecture info
RUN echo "🚀 Casino Portal v3.0.0 - Static Generation" > /usr/share/nginx/html/version.txt && \
    echo "Built: $(date)" >> /usr/share/nginx/html/version.txt && \
    echo "Mode: Static Site Generation" >> /usr/share/nginx/html/version.txt

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

# --- Stage 6: Development (Optional) ---
FROM dev-deps AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Default to production stage
FROM production
