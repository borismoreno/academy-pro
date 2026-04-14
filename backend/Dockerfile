# Build: docker build -t academypro-backend .
# Run:   docker run -p 3000:3000 --env-file .env academypro-backend
# Or use docker-compose.yml for local development

# ─── Stage 1: Builder ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma client generated artifacts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Prisma schema and migrations (needed for migrate deploy)
COPY prisma ./prisma

ENV NODE_ENV=production

EXPOSE 3000

# Run pending migrations then start the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
