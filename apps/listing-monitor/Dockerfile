FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl
RUN corepack enable && corepack prepare pnpm@9 --activate
WORKDIR /app

FROM base AS deps
RUN printf "shamefully-hoist=true\nstrict-peer-dependencies=false\nnode-linker=hoisted\n" > .npmrc
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/listing-monitor/package.json ./apps/listing-monitor/
COPY packages/db/package.json ./packages/db/
RUN pnpm install --frozen-lockfile

FROM base AS runner
WORKDIR /app

RUN npm install -g tsx

RUN addgroup --system --gid 1001 appgroup
RUN adduser --system --uid 1001 appuser

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=deps /app/apps/listing-monitor/node_modules ./apps/listing-monitor/node_modules
COPY apps/listing-monitor ./apps/listing-monitor
COPY packages/db ./packages/db

RUN pnpm --filter @razbor/db db:generate

USER appuser

ENV NODE_ENV=production
ENV ADMIN_PORT=3001

EXPOSE 3001

CMD ["node", "--import", "tsx", "apps/listing-monitor/src/index.ts"]
