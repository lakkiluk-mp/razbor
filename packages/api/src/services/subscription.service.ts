import type { PrismaClient, Subscription } from '@razbor/db'
import type Redis from 'ioredis'
import { SUBSCRIPTION_PLANS, getMonitorSlotLimits, MONITOR_SUBSCRIPTIONS_CHANNEL, type SubscriptionPlanKey } from '@razbor/shared'
import { GraphQLError } from 'graphql'

import { ACTIVE_STATUSES } from './credits.service'

export async function getActiveSubscription(
  prisma: PrismaClient,
  userId: string,
): Promise<Subscription | null> {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ACTIVE_STATUSES },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createSubscription(
  prisma: PrismaClient,
  userId: string,
  plan: SubscriptionPlanKey,
): Promise<Subscription> {
  const planData = SUBSCRIPTION_PLANS[plan]
  const now = new Date()
  const periodEnd = new Date(now.getTime() + planData.days * 24 * 60 * 60 * 1000)

  return prisma.$transaction(async (tx) => {
    const existing = await tx.subscription.findFirst({
      where: {
        userId,
        status: { in: ACTIVE_STATUSES },
      },
    })
    if (existing) {
      throw new GraphQLError('У вас уже есть активная подписка')
    }

    const subscription = await tx.subscription.create({
      data: {
        userId,
        plan,
        status: 'active',
        credits: planData.credits,
        creditsTotal: planData.credits,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: { isPremium: true },
    })

    return subscription
  })
}

export async function switchSubscription(
  prisma: PrismaClient,
  userId: string,
  plan: SubscriptionPlanKey,
): Promise<Subscription> {
  const planData = SUBSCRIPTION_PLANS[plan]
  const now = new Date()
  const periodEnd = new Date(now.getTime() + planData.days * 24 * 60 * 60 * 1000)

  return prisma.$transaction(async (tx) => {
    const existing = await tx.subscription.findFirst({
      where: {
        userId,
        status: { in: ACTIVE_STATUSES },
      },
    })

    if (existing && !existing.cancelAtPeriodEnd) {
      throw new GraphQLError('У вас уже есть активная подписка')
    }

    if (existing && existing.cancelAtPeriodEnd) {
      if (existing.credits > 0) {
        console.log(
          `[switchSubscription] User ${userId} lost ${existing.credits} credits from sub ${existing.id}`,
        )
      }
      await tx.subscription.update({
        where: { id: existing.id },
        data: { status: 'expired', credits: 0 },
      })
    }

    const subscription = await tx.subscription.create({
      data: {
        userId,
        plan,
        status: 'active',
        credits: planData.credits,
        creditsTotal: planData.credits,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: { isPremium: true },
    })

    return subscription
  }, { isolationLevel: 'Serializable' })
}

export async function cancelSubscription(
  prisma: PrismaClient,
  subscriptionId: string,
  userId: string,
): Promise<Subscription> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })
  if (!subscription || subscription.userId !== userId) {
    throw new GraphQLError('Подписка не найдена')
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { cancelAtPeriodEnd: true },
  })
}

export async function resumeSubscription(
  prisma: PrismaClient,
  subscriptionId: string,
  userId: string,
): Promise<Subscription> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })
  if (!subscription || subscription.userId !== userId) {
    throw new GraphQLError('Подписка не найдена')
  }
  if (!subscription.cancelAtPeriodEnd) {
    throw new GraphQLError('Подписка не была отменена')
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { cancelAtPeriodEnd: false },
  })
}

export async function renewSubscription(
  prisma: PrismaClient,
  subscriptionId: string,
): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })
  if (!subscription) {
    throw new GraphQLError('Подписка не найдена')
  }
  if (subscription.status !== 'active' && subscription.status !== 'past_due') {
    throw new GraphQLError('Невозможно продлить подписку в статусе ' + subscription.status)
  }

  const planData = SUBSCRIPTION_PLANS[subscription.plan]
  const now = new Date()
  const periodEnd = new Date(now.getTime() + planData.days * 24 * 60 * 60 * 1000)

  await prisma.subscription.update({
    where: { id: subscriptionId },
    data: {
      credits: subscription.creditsTotal,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      retryCount: 0,
      lastRetryAt: null,
      status: 'active',
      cancelAtPeriodEnd: false,
    },
  })
}

export async function expireSubscription(
  prisma: PrismaClient,
  subscriptionId: string,
  redis?: Redis | null,
): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    select: { userId: true },
  })
  if (!subscription) {
    throw new GraphQLError('Подписка не найдена')
  }

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'expired', credits: 0 },
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

    if (redis) {
      const channel = MONITOR_SUBSCRIPTIONS_CHANNEL
      for (const id of idsToDeactivate) {
        try {
          await redis.publish(channel, JSON.stringify({ action: 'deactivated', subscriptionId: id }))
        } catch (err) {
          console.error('[expireSubscription] Failed to publish Redis event:', err)
        }
      }
    }
  }
}
