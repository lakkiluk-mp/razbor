FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

FROM base AS deps
RUN printf "shamefully-hoist=true\nstrict-peer-dependencies=false\nnode-linker=hoisted\n" > .npmrc
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/server/package.json ./apps/server/
COPY apps/mini-app/package.json ./apps/mini-app/
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY packages/graphql-client/package.json ./packages/graphql-client/
COPY packages/hooks/package.json ./packages/hooks/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/ ./
COPY . .
RUN pnpm db:generate
ENV VITE_API_URL=""
RUN pnpm --filter @razbor/mini-app build
RUN pnpm --filter @razbor/server build

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache su-exec
RUN npm install -g prisma@5 tsx

RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 appuser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/apps/mini-app/dist ./apps/mini-app/dist
COPY --from=builder /app/apps/mini-app/package.json ./apps/mini-app/
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/api/package.json ./packages/api/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

ENTRYPOINT ["/entrypoint.sh"]
CMD ["node", "apps/server/dist/index.cjs"]
