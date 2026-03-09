-- DropForeignKey
ALTER TABLE "monitor_subscriptions" DROP CONSTRAINT "monitor_subscriptions_userId_fkey";

-- AddForeignKey
ALTER TABLE "monitor_subscriptions" ADD CONSTRAINT "monitor_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
