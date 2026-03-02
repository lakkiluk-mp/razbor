-- AlterTable: convert imageUrl to imageUrls array
ALTER TABLE "broadcasts" ADD COLUMN "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migrate existing data
UPDATE "broadcasts" SET "imageUrls" = ARRAY["imageUrl"] WHERE "imageUrl" IS NOT NULL;

-- Drop old column
ALTER TABLE "broadcasts" DROP COLUMN "imageUrl";
