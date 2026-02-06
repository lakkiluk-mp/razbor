-- AlterTable: Add OEM Price Sharing fields to Part
ALTER TABLE "parts" ADD COLUMN "isShared" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "parts" ADD COLUMN "oemCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "parts_oemCode_key" ON "parts"("oemCode");
CREATE INDEX "parts_isShared_idx" ON "parts"("isShared");
CREATE INDEX "parts_oemCode_idx" ON "parts"("oemCode");

-- AlterTable: Make generationId nullable in Price (for shared parts)
ALTER TABLE "prices" ALTER COLUMN "generationId" DROP NOT NULL;
