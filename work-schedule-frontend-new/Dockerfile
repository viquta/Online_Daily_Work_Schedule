# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.13.1

# --- Build Stage ---
FROM node:${NODE_VERSION}-slim AS builder
WORKDIR /app

# Install build dependencies only
COPY --link package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy the rest of the application source
COPY --link . .

# Build the production-ready static files
RUN npm run build

# Keep production dependencies needed for vite preview
RUN npm prune --production

# --- Production Stage ---
FROM node:${NODE_VERSION}-slim AS final
WORKDIR /app

# Create non-root user and group
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Create a home directory for the user and set npm cache path
RUN mkdir /home/appuser && chown appuser:appgroup /home/appuser
ENV NPM_CONFIG_CACHE=/home/appuser/.npm
ENV HOME=/home/appuser

# Copy built app and production dependencies from builder stage
# Ensure ownership is correct before switching user
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./
COPY --from=builder --chown=appuser:appgroup /app/package-lock.json ./
# index.html is usually inside dist after build, but copy if needed separately
# COPY --from=builder --chown=appuser:appgroup /app/index.html ./

# Ensure the work directory itself is owned by the user
RUN chown -R appuser:appgroup /app

USER appuser

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

EXPOSE 4173

# Use the locally installed vite binary instead of npx to avoid potential npx cache issues
CMD ["./node_modules/.bin/vite", "preview", "--host", "0.0.0.0", "--port", "4173"]
