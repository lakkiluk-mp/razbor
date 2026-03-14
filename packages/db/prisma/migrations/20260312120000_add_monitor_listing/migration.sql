-- DropIndex
DROP INDEX "monitor_listings_createdAt_idx";

-- DropIndex
DROP INDEX "monitor_listings_regionSlug_publishedAt_idx";

-- AlterTable
ALTER TABLE "monitor_listings" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "configGroups" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "engineVolume" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "estimateAvg" INTEGER,
ADD COLUMN     "estimateExact" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "estimateMax" INTEGER,
ADD COLUMN     "estimateMin" INTEGER,
ADD COLUMN     "generationId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDamaged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "model" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "profit" INTEGER,
ADD COLUMN     "transmission" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "monitor_listings_regionSlug_isActive_publishedAt_idx" ON "monitor_listings"("regionSlug", "isActive", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "monitor_listings_regionSlug_brand_idx" ON "monitor_listings"("regionSlug", "brand");

-- CreateIndex
CREATE INDEX "monitor_listings_regionSlug_profit_idx" ON "monitor_listings"("regionSlug", "profit" DESC);

-- CreateIndex
CREATE INDEX "monitor_listings_lastSeenAt_idx" ON "monitor_listings"("lastSeenAt");
