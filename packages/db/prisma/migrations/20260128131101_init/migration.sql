-- CreateEnum
CREATE TYPE "BodyType" AS ENUM ('sedan', 'hatchback', 'liftback', 'crossover', 'suv', 'wagon', 'coupe', 'minivan', 'pickup');

-- CreateEnum
CREATE TYPE "PartCategory" AS ENUM ('body', 'optics', 'glass', 'interior', 'engine', 'transmission', 'suspension', 'electrical', 'cooling', 'other');

-- CreateEnum
CREATE TYPE "ZoneType" AS ENUM ('exterior', 'interior', 'mechanical');

-- CreateTable
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generations" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "yearStart" INTEGER NOT NULL,
    "yearEnd" INTEGER,
    "bodyType" "BodyType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "PartCategory" NOT NULL,
    "schematicZoneId" TEXT,
    "searchQueries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "model_parts" (
    "id" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "model_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schematic_zones" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneType" "ZoneType" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schematic_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" TEXT NOT NULL,
    "partId" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "minPrice" INTEGER NOT NULL,
    "maxPrice" INTEGER NOT NULL,
    "median" INTEGER NOT NULL,
    "avgPrice" INTEGER NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'avito',
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "brands_sortOrder_idx" ON "brands"("sortOrder");

-- CreateIndex
CREATE INDEX "models_brandId_idx" ON "models"("brandId");

-- CreateIndex
CREATE INDEX "models_sortOrder_idx" ON "models"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "models_brandId_slug_key" ON "models"("brandId", "slug");

-- CreateIndex
CREATE INDEX "generations_modelId_idx" ON "generations"("modelId");

-- CreateIndex
CREATE INDEX "generations_bodyType_idx" ON "generations"("bodyType");

-- CreateIndex
CREATE INDEX "generations_isActive_idx" ON "generations"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "generations_modelId_slug_key" ON "generations"("modelId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "parts_slug_key" ON "parts"("slug");

-- CreateIndex
CREATE INDEX "parts_category_idx" ON "parts"("category");

-- CreateIndex
CREATE INDEX "parts_schematicZoneId_idx" ON "parts"("schematicZoneId");

-- CreateIndex
CREATE INDEX "model_parts_generationId_idx" ON "model_parts"("generationId");

-- CreateIndex
CREATE INDEX "model_parts_partId_idx" ON "model_parts"("partId");

-- CreateIndex
CREATE UNIQUE INDEX "model_parts_generationId_partId_key" ON "model_parts"("generationId", "partId");

-- CreateIndex
CREATE UNIQUE INDEX "schematic_zones_code_key" ON "schematic_zones"("code");

-- CreateIndex
CREATE INDEX "prices_partId_idx" ON "prices"("partId");

-- CreateIndex
CREATE INDEX "prices_generationId_idx" ON "prices"("generationId");

-- CreateIndex
CREATE INDEX "prices_updatedAt_idx" ON "prices"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "prices_partId_generationId_key" ON "prices"("partId", "generationId");

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generations" ADD CONSTRAINT "generations_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts" ADD CONSTRAINT "parts_schematicZoneId_fkey" FOREIGN KEY ("schematicZoneId") REFERENCES "schematic_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_parts" ADD CONSTRAINT "model_parts_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "model_parts" ADD CONSTRAINT "model_parts_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_partId_fkey" FOREIGN KEY ("partId") REFERENCES "parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "generations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
