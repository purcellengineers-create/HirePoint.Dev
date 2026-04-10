FROM node:20-slim AS base
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# -- Dependencies --
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# -- Build --
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV DATABASE_URL="file:/app/prisma/build.db"
ENV NEXTAUTH_SECRET="build-time-placeholder"

RUN npx prisma generate
RUN npx prisma migrate deploy
RUN npx tsx prisma/seed.ts
RUN npm run build

# Install production-only deps for better-sqlite3 native addon in standalone
RUN cd .next/standalone && npm install better-sqlite3 @prisma/adapter-better-sqlite3 dotenv 2>/dev/null || true

# -- Production --
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /data && chown nextjs:nodejs /data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/src/generated ./src/generated

COPY --from=builder /app/prisma/build.db /app/prisma/seed.db

COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV DATABASE_URL="file:/data/app.db"

ENTRYPOINT ["./docker-entrypoint.sh"]
