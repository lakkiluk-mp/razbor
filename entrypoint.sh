#!/bin/sh
set -e

if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy --schema=/app/packages/db/prisma/schema.prisma
fi

exec su-exec nextjs "$@"
