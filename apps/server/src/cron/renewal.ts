import type { PrismaClient } from '@razbor/db'
import { SUBSCRIPTION_MAX_RETRIES } from '@razbor/shared'
import { renewSubscription, expireSubscription, ACTIVE_STATUSES } from '@razbor/api'

export async function processRenewals(prisma: PrismaClient): Promise<void> {
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      currentPeriodEnd: { lt: new Date() },
      status: { in: ACTIVE_STATUSES },
    },
  })

  for (const subscription of expiredSubscriptions) {
    try {
      if (subscription.cancelAtPeriodEnd) {
        await prisma.$transaction([
          prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'canceled', credits: 0 },
          }),
          prisma.user.update({
            where: { id: subscription.userId },
            data: { isPremium: false },
          }),
        ])
        continue
      }

      if (subscription.status === 'active') {
        // TODO: Этап 2 — реальное списание через платежную систему
        await renewSubscription(prisma, subscription.id)
        continue
      }

      if (subscription.status === 'past_due') {
        if (subscription.retryCount >= SUBSCRIPTION_MAX_RETRIES) {
          await expireSubscription(prisma, subscription.id)
        } else {
          const daysSinceLastRetry = subscription.lastRetryAt
            ? (Date.now() - subscription.lastRetryAt.getTime()) / (24 * 60 * 60 * 1000)
            : Infinity
          const requiredDelay = subscription.retryCount

          if (daysSinceLastRetry >= requiredDelay) {
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: { retryCount: { increment: 1 }, lastRetryAt: new Date() },
            })
          }
        }
      }
    } catch (err) {
      console.error(`[Renewal] Failed to process subscription ${subscription.id}:`, err)
    }
  }
}

export function startRenewalCron(prisma: PrismaClient): void {
  console.log('[Renewal] Cron started, interval: 1h')
  processRenewals(prisma).catch(console.error)
  setInterval(() => processRenewals(prisma).catch(console.error), 60 * 60 * 1000)
}
