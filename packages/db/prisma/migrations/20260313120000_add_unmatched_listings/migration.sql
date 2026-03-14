-- CreateTable
CREATE TABLE "unmatched_listings" (
    "id" TEXT NOT NULL,
    "regionSlug" TEXT NOT NULL,
    "extId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand" TEXT NOT NULL DEFAULT '',
    "model" TEXT NOT NULL DEFAULT '',
    "year" INTEGER,
    "price" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unmatched_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unmatched_listings_extId_regionSlug_key" ON "unmatched_listings"("extId", "regionSlug");

-- CreateIndex
CREATE INDEX "unmatched_listings_regionSlug_reason_idx" ON "unmatched_listings"("regionSlug", "reason");

-- CreateIndex
CREATE INDEX "unmatched_listings_brand_model_idx" ON "unmatched_listings"("brand", "model");
