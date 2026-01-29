/*
  Warnings:

  - You are about to drop the column `configType` on the `parts` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "parts_configType_idx";

-- AlterTable
ALTER TABLE "parts" DROP COLUMN "configType",
ADD COLUMN     "configGroup" TEXT;

-- DropEnum
DROP TYPE "ConfigType";

-- CreateIndex
CREATE INDEX "parts_configGroup_idx" ON "parts"("configGroup");
