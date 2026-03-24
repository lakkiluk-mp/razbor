-- CreateTable
CREATE TABLE "admin_search_watches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notificationsSent" INTEGER NOT NULL DEFAULT 0,
    "lastNotifiedAt" TIMESTAMP(3),
    "lastCrawledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_search_watches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_search_watches_userId_idx" ON "admin_search_watches"("userId");

-- CreateIndex
CREATE INDEX "admin_search_watches_isActive_idx" ON "admin_search_watches"("isActive");

-- AddForeignKey
ALTER TABLE "admin_search_watches" ADD CONSTRAINT "admin_search_watches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
