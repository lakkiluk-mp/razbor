FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY .npmrc ./
COPY apps/server/package.json ./apps/server/
COPY apps/mini-app/package.json ./apps/mini-app/
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/graphql-client/package.json ./packages/graphql-client/
COPY packages/hooks/package.json ./packages/hooks/
COPY tools/price-updater/package.json ./tools/price-updater/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/ ./
COPY . .
RUN pnpm db:generate
ENV VITE_API_URL=""
RUN pnpm --filter @razbor/mini-app build
RUN pnpm --filter @razbor/server build

FROM base AS prod-deps
COPY --from=deps /app/ ./
COPY . .
RUN pnpm db:generate
RUN pnpm install --frozen-lockfile --prod

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl su-exec
RUN npm install -g prisma@5 tsx

RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 appuser

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/mini-app/dist ./public
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/packages/api/src/generated ./packages/api/src/generated

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "dist/index.js"]
