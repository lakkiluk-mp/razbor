import type { PrismaClient, MonitorSubscription } from '@razbor/db'
import type Redis from 'ioredis'
import { GraphQLError } from 'graphql'
import { MONITOR_SLOT_LIMITS } from '@razbor/shared'

const CHANNEL = 'monitor:subscriptions:changed'

async function publishEvent(redis: Redis | null, action: string, subscriptionId: string): Promise<void> {
  if (!redis) return
  try {
    await redis.publish(CHANNEL, JSON.stringify({ action, subscriptionId }))
  } catch (err) {
    console.error('[Monitor] Failed to publish Redis event:', err)
  }
}

async function getSlotLimit(prisma: PrismaClient, userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  })
  return user?.isPremium ? MONITOR_SLOT_LIMITS.premium : MONITOR_SLOT_LIMITS.trial
}

async function verifyOwnership(prisma: PrismaClient, userId: string, id: string): Promise<MonitorSubscription> {
  const sub = await prisma.monitorSubscription.findUnique({ where: { id } })
  if (!sub || sub.userId !== userId) {
    throw new GraphQLError('Подписка не найдена')
  }
  return sub
}

function validateFilters(input: {
  priceMin?: number | null
  priceMax?: number | null
  yearMin?: number | null
  yearMax?: number | null
  mileageMax?: number | null
}): void {
  if (input.priceMin != null && input.priceMin <= 0) {
    throw new GraphQLError('priceMin должен быть положительным числом', {
      extensions: { code: 'INVALID_INPUT' },
    })
  }
  if (input.priceMax != null && input.priceMax <= 0) {
    throw new GraphQLError('priceMax должен быть положительным числом', {
      extensions: { code: 'INVALID_INPUT' },
    })
  }
  if (input.priceMin != null && input.priceMax != null && input.priceMin >= input.priceMax) {
    throw new GraphQLError('priceMin должен быть меньше priceMax', {
      extensions: { code: 'INVALID_INPUT' },
    })
  }
  if (input.yearMin != null && input.yearMin <= 0) {
    throw new GraphQLError('yearMin должен быть положительным числом', {
      extensions: { code: 'INVALID_INPUT' },
    })
  }
  if (input.yearMax != null && input.yearMax <= 0) {
    throw new GraphQLError('yearMax должен быть положительным числом', {
      extensions: { code: 'INVALID_INPUT' },
    })
  }
  if (input.yearMin != null && input.yearMax != null && input.yearMin > input.yearMax) {
    throw new GraphQLError('Год «от» не может быть больше года «до»', {
      extensions: { code: 'INVALID_INPUT' },
    })
  }
  if (input.mileageMax != null && input.mileageMax <= 0) {
    throw new GraphQLError('mileageMax должен быть положительным числом', {
      extensions: { code: 'INVALID_INPUT' },
    })
  }
}

export async function createMonitorSubscription(
  prisma: PrismaClient,
  redis: Redis | null,
  userId: string,
  input: {
    label: string
    brandSlug: string
    modelSlug: string
    city?: string | null
    priceMin?: number | null
    priceMax?: number | null
    yearMin?: number | null
    yearMax?: number | null
    mileageMax?: number | null
  },
): Promise<MonitorSubscription> {
  validateFilters(input)

  const slotLimit = await getSlotLimit(prisma, userId)

  const subscription = await prisma.$transaction(async (tx) => {
    const activeCount = await tx.monitorSubscription.count({
      where: { userId, isActive: true },
    })

    if (activeCount >= slotLimit) {
      throw new GraphQLError(
        `Достигнут лимит подписок (${slotLimit}). Удалите или приостановите существующую подписку.`,
        { extensions: { code: 'SLOT_LIMIT_REACHED', limit: slotLimit } },
      )
    }

    return tx.monitorSubscription.create({
      data: {
        userId,
        label: input.label,
        brandSlug: input.brandSlug,
        modelSlug: input.modelSlug,
        city: input.city ?? undefined,
        priceMin: input.priceMin ?? undefined,
        priceMax: input.priceMax ?? undefined,
        yearMin: input.yearMin ?? undefined,
        yearMax: input.yearMax ?? undefined,
        mileageMax: input.mileageMax ?? undefined,
      },
    })
  })

  await publishEvent(redis, 'created', subscription.id)
  return subscription
}

export async function updateMonitorSubscription(
  prisma: PrismaClient,
  redis: Redis | null,
  userId: string,
  id: string,
  input: {
    label?: string | null
    isActive?: boolean | null
    city?: string | null
    priceMin?: number | null
    priceMax?: number | null
    yearMin?: number | null
    yearMax?: number | null
    mileageMax?: number | null
  },
): Promise<MonitorSubscription> {
  await verifyOwnership(prisma, userId, id)
  validateFilters(input)

  const data: Record<string, unknown> = {}
  if (input.label != null) data.label = input.label
  if (input.isActive != null) data.isActive = input.isActive
  if (input.city !== undefined) data.city = input.city
  if (input.priceMin !== undefined) data.priceMin = input.priceMin
  if (input.priceMax !== undefined) data.priceMax = input.priceMax
  if (input.yearMin !== undefined) data.yearMin = input.yearMin
  if (input.yearMax !== undefined) data.yearMax = input.yearMax
  if (input.mileageMax !== undefined) data.mileageMax = input.mileageMax

  const subscription = await prisma.monitorSubscription.update({
    where: { id },
    data,
  })

  await publishEvent(redis, 'updated', subscription.id)
  return subscription
}

export async function deleteMonitorSubscription(
  prisma: PrismaClient,
  redis: Redis | null,
  userId: string,
  id: string,
): Promise<void> {
  await verifyOwnership(prisma, userId, id)

  await prisma.monitorSubscription.delete({ where: { id } })

  await publishEvent(redis, 'deleted', id)
}

export async function pauseMonitorSubscription(
  prisma: PrismaClient,
  redis: Redis | null,
  userId: string,
  id: string,
): Promise<MonitorSubscription> {
  const existing = await verifyOwnership(prisma, userId, id)

  const subscription = await prisma.monitorSubscription.update({
    where: { id },
    data: { isActive: !existing.isActive },
  })

  await publishEvent(redis, existing.isActive ? 'paused' : 'resumed', subscription.id)
  return subscription
}
