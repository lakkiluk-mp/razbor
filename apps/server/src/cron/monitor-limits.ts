import type { PrismaClient } from '@razbor/db'
import { getMonitorSlotLimits, MONITOR_SUBSCRIPTIONS_CHANNEL } from '@razbor/shared'
import { getRedis } from '@razbor/cache'

export async function enforceMonitorLimits(prisma: PrismaClient): Promise<void> {
  const grouped = await prisma.monitorSubscription.groupBy({
    by: ['userId'],
    where: { isActive: true },
    _count: { id: true },
  })

  if (grouped.length === 0) return

  const limits = getMonitorSlotLimits()

  const userIds = grouped.map((g) => g.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, isPremium: true },
  })
  const userMap = new Map(users.map((u) => [u.id, u.isPremium]))

  for (const group of grouped) {
    const isPremium = userMap.get(group.userId) ?? false
    const limit = isPremium ? limits.premium : limits.trial
    const activeCount = group._count.id

    if (activeCount <= limit) continue

    const subs = await prisma.monitorSubscription.findMany({
      where: { userId: group.userId, isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    const toDeactivate = subs.slice(limit)
    const idsToDeactivate = toDeactivate.map((s) => s.id)

    await prisma.monitorSubscription.updateMany({
      where: { id: { in: idsToDeactivate } },
      data: { isActive: false },
    })

    console.log(
      `[MonitorLimits] User ${group.userId}: deactivated ${idsToDeactivate.length} excess monitors (limit=${limit}, had=${activeCount})`,
    )

    const redis = getRedis()
    if (redis) {
      for (const id of idsToDeactivate) {
        try {
          await redis.publish(
            MONITOR_SUBSCRIPTIONS_CHANNEL,
            JSON.stringify({ action: 'deactivated', subscriptionId: id }),
          )
        } catch (err) {
          console.error('[MonitorLimits] Failed to publish Redis event:', err)
        }
      }
    }
  }
}

export function startMonitorLimitsCron(prisma: PrismaClient): void {
  console.log('[MonitorLimits] Cron started, interval: 5m')
  setTimeout(() => enforceMonitorLimits(prisma).catch(console.error), 30_000)
  setInterval(() => enforceMonitorLimits(prisma).catch(console.error), 5 * 60 * 1000)
}
