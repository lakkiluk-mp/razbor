#!/bin/sh
set -e

echo "Applying database migrations..."
pnpm db:migrate:deploy

echo "Seeding database (idempotent)..."
pnpm db:seed || echo "Seed skipped or failed"

echo "Starting development server..."
exec pnpm dev
