-- DropIndex
DROP INDEX "calculations_createdAt_idx";

-- DropIndex
DROP INDEX "calculations_userId_idx";

-- CreateIndex
CREATE INDEX "calculations_userId_createdAt_idx" ON "calculations"("userId", "createdAt");
