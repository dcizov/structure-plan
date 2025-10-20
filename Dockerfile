# Base stage - common dependencies
FROM node:22-alpine AS base
WORKDIR /usr/src/app
EXPOSE 3000

# Dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Builder stage
FROM base AS builder
ARG USER_ID=1000
ARG GROUP_ID=1000

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

# Build for production
RUN npm run build

# Development stage
FROM base AS development
ARG USER_ID=1000
ARG GROUP_ID=1000

COPY package*.json ./
RUN npm ci

COPY . .

# Create user with matching UID/GID for dev
RUN addgroup -g ${GROUP_ID} nodejs && \
    adduser -u ${USER_ID} -G nodejs -s /bin/sh -D nextjs && \
    chown -R nextjs:nodejs /usr/src/app

USER nextjs

ENV NODE_ENV=development
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

# Create non-root user for production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/public ./public

USER nextjs

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]
