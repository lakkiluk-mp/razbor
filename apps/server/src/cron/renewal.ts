import type { PrismaClient } from '@razbor/db'
import { SUBSCRIPTION_PLANS, SUBSCRIPTION_MAX_RETRIES, getMonitorSlotLimits, MONITOR_SUBSCRIPTIONS_CHANNEL } from '@razbor/shared'
import { renewSubscription, expireSubscription, createRecurringPayment, ACTIVE_STATUSES } from '@razbor/api'
import { getRedis } from '@razbor/cache'

async function moveToGracePeriod(prisma: PrismaClient, subscriptionId: string, graceDays: number): Promise<void> {
  const graceEnd = new Date(Date.now() + graceDays * 24 * 60 * 60 * 1000)
  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { status: 'past_due', retryCount: 1, lastRetryAt: new Date(), currentPeriodEnd: graceEnd },
  })
}

async function hasPendingRecurringPayment(prisma: PrismaClient, subscriptionId: string): Promise<boolean> {
  const pending = await prisma.yooPayment.findFirst({
    where: { subscriptionId, status: 'pending', isRecurring: true },
  })
  return !!pending
}

type ChargeResult = 'success' | 'pending_exists' | 'failed'

async function chargeSubscription(prisma: PrismaClient, subscription: { id: string; userId: string; plan: string }): Promise<ChargeResult> {
  const planData = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS]
  if (!planData) {
    console.error(`[Renewal] Unknown plan: ${subscription.plan}`)
    return 'failed'
  }

  if (await hasPendingRecurringPayment(prisma, subscription.id)) {
    console.log(`[Renewal] ${subscription.id} has pending recurring payment, skipping charge`)
    return 'pending_exists'
  }

  const defaultMethod = await prisma.paymentMethod.findFirst({
    where: { userId: subscription.userId, isDefault: true },
  })

  if (!defaultMethod) {
    console.log(`[Renewal] No payment method for user ${subscription.userId}, expiring subscription`)
    await expireSubscription(prisma, subscription.id, getRedis())
    return 'failed'
  }

  const result = await createRecurringPayment({
    userId: subscription.userId,
    subscriptionId: subscription.id,
    paymentMethodId: defaultMethod.yooPaymentMethodId,
    amount: planData.price,
    description: `Автопродление Razbor — ${planData.label}`,
  })

  await prisma.yooPayment.create({
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
    return 'success'
  }

  return 'failed'
}

export async function cleanupStalePendingPayments(prisma: PrismaClient): Promise<void> {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const result = await prisma.yooPayment.updateMany({
      where: {
        status: 'pending',
        isRecurring: false,
        createdAt: { lt: oneDayAgo },
      },
      data: { status: 'canceled' },
    })
    if (result.count > 0) {
      console.log(`[Cleanup] Canceled ${result.count} stale pending payment(s)`)
    }
  } catch (err) {
    console.error('[Cleanup] Failed to cleanup stale pending payments:', err)
  }
}

export async function processRenewals(prisma: PrismaClient): Promise<void> {
  await cleanupStalePendingPayments(prisma)

  const expiredSubscriptions = await prisma.subscription.findMany({
    where: {
      OR: [
        { currentPeriodEnd: { lt: new Date() }, status: 'active' },
        { status: 'past_due' },
      ],
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

        const activeMonitorSubs = await prisma.monitorSubscription.findMany({
          where: { userId: subscription.userId, isActive: true },
          orderBy: { createdAt: 'asc' },
        })

        const trialLimit = getMonitorSlotLimits().trial
        if (activeMonitorSubs.length > trialLimit) {
          const subsToDeactivate = activeMonitorSubs.slice(trialLimit)
          const idsToDeactivate = subsToDeactivate.map((s) => s.id)

          await prisma.monitorSubscription.updateMany({
            where: { id: { in: idsToDeactivate } },
            data: { isActive: false },
          })

          const redis = getRedis()
          if (redis) {
            for (const id of idsToDeactivate) {
              try {
                await redis.publish(MONITOR_SUBSCRIPTIONS_CHANNEL, JSON.stringify({ action: 'deactivated', subscriptionId: id }))
              } catch (err) {
                console.error('[Renewal] Failed to publish Redis event:', err)
              }
            }
          }
        }

        continue
      }

      if (subscription.status === 'active') {
        const planData = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS]
        const graceDays = planData?.graceDays ?? 1
        console.log(`[Renewal] ${subscription.id} active → charging ${subscription.plan}`)
        try {
          const result = await chargeSubscription(prisma, subscription)
          console.log(`[Renewal] ${subscription.id} charge result: ${result}`)
          if (result === 'failed') {
            console.log(`[Renewal] ${subscription.id} charge failed, moving to past_due with grace period +${graceDays}d`)
            await moveToGracePeriod(prisma, subscription.id, graceDays)
          }
        } catch (err) {
          console.error(`[Renewal] ${subscription.id} charge error, moving to past_due:`, err)
          await moveToGracePeriod(prisma, subscription.id, graceDays)
        }
        continue
      }

      if (subscription.status === 'past_due') {
        const planData = SUBSCRIPTION_PLANS[subscription.plan as keyof typeof SUBSCRIPTION_PLANS]
        const maxRetries = planData?.maxRetries ?? SUBSCRIPTION_MAX_RETRIES
        if (subscription.retryCount >= maxRetries) {
          if (subscription.currentPeriodEnd <= new Date()) {
            console.log(`[Renewal] ${subscription.id} max retries (${subscription.retryCount}) and grace expired → expiring`)
            await expireSubscription(prisma, subscription.id, getRedis())
          } else {
            console.log(`[Renewal] ${subscription.id} max retries but grace period still active until ${subscription.currentPeriodEnd.toISOString()}`)
          }
        } else {
          const daysSinceLastRetry = subscription.lastRetryAt
            ? (Date.now() - subscription.lastRetryAt.getTime()) / (24 * 60 * 60 * 1000)
            : Infinity
          const requiredDelay = subscription.retryCount

          if (daysSinceLastRetry >= requiredDelay) {
            console.log(`[Renewal] ${subscription.id} past_due retry #${subscription.retryCount + 1}`)
            try {
              const chargeResult = await chargeSubscription(prisma, subscription)
              if (chargeResult === 'failed') {
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
