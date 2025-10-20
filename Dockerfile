# Base stage
FROM node:22-alpine AS base
WORKDIR /usr/src/app
EXPOSE 3000

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Builder stage
FROM base AS builder

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build for production
RUN npm run build

# Development stage
FROM base AS development

COPY package*.json ./
RUN npm ci

COPY . .

# Use existing node user (UID 1000, GID 1000)
RUN chown -R node:node /usr/src/app

USER node

ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "run", "dev"]

# Production dependencies
FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Production stage
FROM base AS production

# Create non-root user for production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Copy only production dependencies
COPY --from=prod-deps --chown=nextjs:nodejs /usr/src/app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/package*.json ./

# Copy public directory
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/public ./public

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

CMD ["npm", "start"]
