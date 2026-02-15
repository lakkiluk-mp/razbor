import type { PrismaClient } from '@razbor/db'
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_MAX_RETRIES } from '@razbor/shared'
import { renewSubscription, expireSubscription, createRecurringPayment, ACTIVE_STATUSES } from '@razbor/api'

async function chargeSubscription(prisma: PrismaClient, subscription: { id: string; userId: string; plan: string }) {
  const planData = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS]
  if (!planData) {
    console.error(`[Renewal] Unknown plan: ${subscription.plan}`)
    return false
  }

  const defaultMethod = await prisma.paymentMethod.findFirst({
    where: { userId: subscription.userId, isDefault: true },
  })

  if (!defaultMethod) {
    console.log(`[Renewal] No payment method for user ${subscription.userId}, expiring subscription`)
    await expireSubscription(prisma, subscription.id)
    return false
  }

  const result = await createRecurringPayment({
    userId: subscription.userId,
    subscriptionId: subscription.id,
    paymentMethodId: defaultMethod.yooPaymentMethodId,
    amount: planData.price,
    description: `Автопродление Razbor — ${planData.label}`,
  })

  const yooPayment = await prisma.yooPayment.create({
    data: {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      yooPaymentId: result.yooPaymentId,
      idempotencyKey: result.idempotencyKey,
      amount: planData.price,
      status: result.status === 'succeeded' ? 'succeeded' : result.status === 'canceled' ? 'canceled' : 'pending',
      isRecurring: true,
    },
  })

  if (result.status === 'succeeded') {
    await renewSubscription(prisma, subscription.id)
    return true
  }

  if (result.status === 'canceled') {
    return false
  }

  return false
}

export async function processRenewals(prisma: PrismaClient): Promise<void> {
  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      currentPeriodEnd: { lt: new Date() },
      status: { in: ACTIVE_STATUSES },
    },
  })

  if (expiredSubscriptions.length === 0) return
  console.log(`[Renewal] Found ${expiredSubscriptions.length} expired subscription(s)`)

  for (const subscription of expiredSubscriptions) {
    try {
      if (subscription.cancelAtPeriodEnd) {
        console.log(`[Renewal] ${subscription.id} cancelAtPeriodEnd → canceling`)
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
        console.log(`[Renewal] ${subscription.id} active → charging ${subscription.plan}`)
        try {
          const charged = await chargeSubscription(prisma, subscription)
          console.log(`[Renewal] ${subscription.id} charge result: ${charged ? 'success' : 'failed'}`)
        } catch (err) {
          console.error(`[Renewal] ${subscription.id} charge error, moving to past_due:`, err)
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'past_due', retryCount: 1, lastRetryAt: new Date() },
          })
        }
        continue
      }

      if (subscription.status === 'past_due') {
        if (subscription.retryCount >= SUBSCRIPTION_MAX_RETRIES) {
          console.log(`[Renewal] ${subscription.id} max retries (${subscription.retryCount}) → expiring`)
          await expireSubscription(prisma, subscription.id)
        } else {
          const daysSinceLastRetry = subscription.lastRetryAt
            ? (Date.now() - subscription.lastRetryAt.getTime()) / (24 * 60 * 60 * 1000)
            : Infinity
          const requiredDelay = subscription.retryCount

          if (daysSinceLastRetry >= requiredDelay) {
            console.log(`[Renewal] ${subscription.id} past_due retry #${subscription.retryCount + 1}`)
            try {
              const charged = await chargeSubscription(prisma, subscription)
              if (!charged) {
                await prisma.subscription.update({
                  where: { id: subscription.id },
                  data: { retryCount: { increment: 1 }, lastRetryAt: new Date() },
                })
              }
            } catch (err) {
              console.error(`[Renewal] ${subscription.id} retry failed:`, err)
              await prisma.subscription.update({
                where: { id: subscription.id },
                data: { retryCount: { increment: 1 }, lastRetryAt: new Date() },
              })
            }
          }
        }
      }
    } catch (err) {
      console.error(`[Renewal] Failed to process ${subscription.id}:`, err)
    }
  }
}

export function startRenewalCron(prisma: PrismaClient): void {
  console.log('[Renewal] Cron started, interval: 1h')
  processRenewals(prisma).catch(console.error)
  setInterval(() => processRenewals(prisma).catch(console.error), 60 * 60 * 1000)
}
