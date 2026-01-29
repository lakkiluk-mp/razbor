# === Base ===
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

# === Dependencies ===
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY .npmrc* ./
COPY apps/web/package.json ./apps/web/
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/graphql-client/package.json ./packages/graphql-client/
COPY packages/hooks/package.json ./packages/hooks/
RUN pnpm install --frozen-lockfile

# === Builder ===
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/graphql-client/node_modules ./packages/graphql-client/node_modules
COPY --from=deps /app/packages/hooks/node_modules ./packages/hooks/node_modules
COPY . .

RUN pnpm db:generate

# Build args для NEXT_PUBLIC переменных
ARG NEXT_PUBLIC_FREE_CALCULATIONS_LIMIT=10
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_GRAPHQL_URL

ENV NEXT_PUBLIC_FREE_CALCULATIONS_LIMIT=$NEXT_PUBLIC_FREE_CALCULATIONS_LIMIT
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm build

# === Runner ===
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl wget su-exec

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Prisma для seed и миграций
COPY --from=builder /app/packages/db ./packages/db
COPY --from=builder /app/node_modules ./node_modules

# Установка Prisma CLI и tsx для seed
RUN npm install -g prisma@5 tsx

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "apps/web/server.js"]
