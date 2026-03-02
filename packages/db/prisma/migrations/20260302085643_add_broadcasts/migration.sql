-- CreateEnum
CREATE TYPE "BroadcastStatus" AS ENUM ('draft', 'sending', 'completed', 'failed', 'cancelled');

-- CreateTable
CREATE TABLE "broadcasts" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "imageUrl" TEXT,
    "status" "BroadcastStatus" NOT NULL DEFAULT 'draft',
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcasts_pkey" PRIMARY KEY ("id")
);
