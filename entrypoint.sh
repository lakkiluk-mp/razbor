#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Running database migrations..."
  prisma migrate deploy --schema=/app/packages/db/prisma/schema.prisma
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Migrations completed"
fi

if [ "$RUN_SEED" = "true" ]; then
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Running database seed..."
  cd /app && tsx packages/db/prisma/seed.ts
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] Seed completed"
fi

exec su-exec appuser "$@"
