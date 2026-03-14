-- CreateTable
CREATE TABLE "monitor_listings" (
    "id" TEXT NOT NULL,
    "extId" TEXT NOT NULL,
    "regionSlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "year" INTEGER,
    "url" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "sellerType" TEXT NOT NULL DEFAULT 'Частное лицо',
    "mileage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitor_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monitor_listings_extId_regionSlug_key" ON "monitor_listings"("extId", "regionSlug");

-- CreateIndex
CREATE INDEX "monitor_listings_regionSlug_publishedAt_idx" ON "monitor_listings"("regionSlug", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX "monitor_listings_createdAt_idx" ON "monitor_listings"("createdAt");
