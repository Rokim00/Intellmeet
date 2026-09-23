# ==========================================
# Stage 1: Build Stage (Compile TypeScript)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json pnpm-lock.yaml* package-lock.json* ./
RUN npm ci || npm install

# Copy source code and tsconfig
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to dist/
RUN npm run build

# ==========================================
# Stage 2: Production Execution Stage
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install only production dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN npm ci --only=production || npm install --production

# Copy compiled JavaScript from builder stage
COPY --from=builder /app/dist ./dist

# Security: Use non-root node user
USER node

EXPOSE 5000

# Healthcheck monitoring /api/v1/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["node", "dist/server.js"]
