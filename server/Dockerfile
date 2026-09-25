# syntax=docker/dockerfile:1.7
# ==========================================
# IntellMeet API Server
# Stage 1: compile TypeScript  |  Stage 2: production runtime
# ==========================================

# ---------- Stage 1: compile TypeScript ----------
FROM node:22-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY tsconfig.json ./
COPY src ./src
RUN pnpm run build

# ---------- Stage 2: production runtime ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Production-only dependency tree
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

# Secrets are mounted read-only at /run/secrets by Docker, never baked into the image
ENV MONGO_URI_FILE=/run/secrets/mongo_uri \
    JWT_ACCESS_SECRET_FILE=/run/secrets/jwt_access_secret \
    JWT_REFRESH_SECRET_FILE=/run/secrets/jwt_refresh_secret

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/v1/health || exit 1

CMD ["node", "dist/server.js"]
