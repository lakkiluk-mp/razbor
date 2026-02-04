#!/bin/sh
set -e

echo "Generating Prisma client..."
pnpm db:generate

echo "Applying database migrations..."
pnpm db:migrate:deploy

echo "Seeding database (idempotent)..."
pnpm db:seed || echo "Seed skipped or failed"

echo "Starting server and mini-app..."
exec pnpm dev:server & pnpm dev:mini-app
