-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "username" TEXT,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generationId" TEXT NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "damagedZones" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "telegramPaymentId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "calculationsCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegramId_key" ON "users"("telegramId");

-- CreateIndex
CREATE INDEX "calculations_userId_idx" ON "calculations"("userId");

-- CreateIndex
CREATE INDEX "calculations_generationId_idx" ON "calculations"("generationId");

-- CreateIndex
CREATE INDEX "calculations_createdAt_idx" ON "calculations"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payments_telegramPaymentId_key" ON "payments"("telegramPaymentId");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "generations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
