-- AlterTable
ALTER TABLE "prices" ADD COLUMN "liquidityAgeDays" DOUBLE PRECISION,
ADD COLUMN "liquidityListings" INTEGER,
ADD COLUMN "liquidityScore" TEXT;
