#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  prisma migrate deploy --schema=/app/packages/db/prisma/schema.prisma
fi

if [ "$RUN_SEED" = "true" ]; then
  echo "Running database seed..."
  cd /app && tsx packages/db/prisma/seed.ts
fi

exec su-exec nextjs "$@"
