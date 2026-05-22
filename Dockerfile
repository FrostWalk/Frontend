# Stage 1: Builder
FROM node:lts-alpine AS builder

# Install Corepack + pnpm (Node >=25 no longer bundles corepack)
RUN npm install -g corepack@latest && corepack enable && corepack install -g pnpm@latest

# Build arguments for version information
ARG APP_VERSION
ARG APP_COMMIT_HASH

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy application code
COPY . .

# Set environment variables for build
ENV NUXT_PUBLIC_APP_VERSION=${APP_VERSION}
ENV NUXT_PUBLIC_APP_COMMIT_HASH=${APP_COMMIT_HASH}

# Build the application
RUN pnpm run build

# Stage 2: Production
FROM node:lts-alpine AS runner

# Install Corepack + pnpm (Node >=25 no longer bundles corepack)
RUN npm install -g corepack@latest && corepack enable && corepack install -g pnpm@latest

WORKDIR /app

# Create a non-root user (Debian syntax)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nuxt

# Copy necessary files from builder
COPY --from=builder --chown=nuxt:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxt:nodejs /app/package.json ./package.json

# Switch to non-root user
USER nuxt

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
# Default API URL (can be overridden at runtime)
ENV NUXT_PUBLIC_API_BASE_URL=""
ENV NODE_ENV=production
ENV HOST=0.0.0.0

# Start the application
CMD ["node", ".output/server/index.mjs"]

