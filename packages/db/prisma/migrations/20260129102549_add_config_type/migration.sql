-- CreateEnum
CREATE TYPE "ConfigType" AS ENUM ('engine_1_6_106', 'engine_1_8_122', 'engine_1_6_turbo', 'transmission_mt', 'transmission_at');

-- AlterTable
ALTER TABLE "parts" ADD COLUMN     "configType" "ConfigType";

-- CreateIndex
CREATE INDEX "parts_configType_idx" ON "parts"("configType");
