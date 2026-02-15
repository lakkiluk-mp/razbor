-- CreateIndex (partial unique)
-- Prevents multiple active/past_due subscriptions per user at DB level
CREATE UNIQUE INDEX "subscriptions_userId_active_unique"
ON "subscriptions" ("userId")
WHERE "status" IN ('active', 'past_due');
