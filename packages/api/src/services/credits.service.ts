import type { PrismaClient, SubscriptionStatus } from '@razbor/db'
import { GraphQLError } from 'graphql'

export const ACTIVE_STATUSES: SubscriptionStatus[] = ['active', 'past_due']

async function findActiveSubscription(prisma: PrismaClient, userId: string) {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: { in: ACTIVE_STATUSES },
    },
    orderBy: { createdAt: 'desc' },
    select: { id: true, credits: true },
  })
}

export async function getRemainingCredits(
  prisma: PrismaClient,
  userId: string,
): Promise<{ trial: number; subscription: number; total: number }> {
  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { trialCredits: true },
    }),
    findActiveSubscription(prisma, userId),
  ])

  const trial = user?.trialCredits ?? 0
  const subscriptionCredits = subscription?.credits ?? 0

  return {
    trial,
    subscription: subscriptionCredits,
    total: trial + subscriptionCredits,
  }
}

export type CreditSource =
  | { type: 'subscription'; subscriptionId: string }
  | { type: 'trial' }

export async function useCredit(prisma: PrismaClient, userId: string): Promise<CreditSource> {
  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findFirst({
      where: {
        userId,
        status: { in: ACTIVE_STATUSES },
        credits: { gt: 0 },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    })

    if (subscription) {
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { credits: { decrement: 1 } },
      })
      return { type: 'subscription' as const, subscriptionId: subscription.id }
    }

    const result = await tx.user.updateMany({
      where: { id: userId, trialCredits: { gt: 0 } },
      data: { trialCredits: { decrement: 1 } },
    })
    if (result.count > 0) return { type: 'trial' as const }

    throw new GraphQLError('Лимит расчётов исчерпан')
  })
}

export async function refundCredit(prisma: PrismaClient, userId: string, source: CreditSource): Promise<void> {
  if (source.type === 'subscription') {
    await prisma.subscription.update({
      where: { id: source.subscriptionId },
      data: { credits: { increment: 1 } },
    })
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { trialCredits: { increment: 1 } },
    })
  }
}

export async function hasCredits(prisma: PrismaClient, userId: string): Promise<boolean> {
  return (await getRemainingCredits(prisma, userId)).total > 0
}
