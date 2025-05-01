# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.13.1
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Install dependencies in a separate layer for better caching
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --production

# Copy application source code (excluding node_modules and .env via .dockerignore)
COPY --link src/ ./src/
COPY --link create_test_data.js ./create_test_data.js
COPY --link admin_cookies.txt ./admin_cookies.txt

# Create a non-root user and switch to it
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser

# Set environment variables
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

EXPOSE 3001

CMD ["npm", "start"]
