-- CreateEnum
CREATE TYPE "MonitorLogType" AS ENUM ('CRAWL', 'NOTIFICATION', 'PROXY', 'STRATEGY', 'SYSTEM');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('DEBUG', 'INFO', 'WARN', 'ERROR');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "trialMonitorStartedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "monitor_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "brandSlug" TEXT NOT NULL,
    "modelSlug" TEXT NOT NULL,
    "city" TEXT,
    "priceMin" INTEGER,
    "priceMax" INTEGER,
    "yearMin" INTEGER,
    "yearMax" INTEGER,
    "mileageMax" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notificationsSent" INTEGER NOT NULL DEFAULT 0,
    "lastNotifiedAt" TIMESTAMP(3),

    CONSTRAINT "monitor_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monitor_logs" (
    "id" TEXT NOT NULL,
    "type" "MonitorLogType" NOT NULL,
    "level" "LogLevel" NOT NULL DEFAULT 'INFO',
    "brandSlug" TEXT,
    "modelSlug" TEXT,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monitor_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monitor_subscriptions_brandSlug_modelSlug_isActive_idx" ON "monitor_subscriptions"("brandSlug", "modelSlug", "isActive");

-- CreateIndex
CREATE INDEX "monitor_subscriptions_userId_idx" ON "monitor_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "monitor_logs_type_createdAt_idx" ON "monitor_logs"("type", "createdAt");

-- CreateIndex
CREATE INDEX "monitor_logs_brandSlug_modelSlug_createdAt_idx" ON "monitor_logs"("brandSlug", "modelSlug", "createdAt");

-- AddForeignKey
ALTER TABLE "monitor_subscriptions" ADD CONSTRAINT "monitor_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
