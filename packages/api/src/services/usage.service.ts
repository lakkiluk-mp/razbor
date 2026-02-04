import type { PrismaClient } from '@razbor/db'
import { FREE_CALCULATIONS_LIMIT } from '@razbor/shared'

function getMoscowMidnight(): { todayStart: Date; nextReset: Date } {
  const now = new Date()
  const moscowOffset = 3 * 60
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000
  const moscowMs = utcMs + moscowOffset * 60_000
  const moscowDate = new Date(moscowMs)

  const todayStartMoscow = new Date(moscowDate)
  todayStartMoscow.setHours(0, 0, 0, 0)
  const todayStartUtc = new Date(todayStartMoscow.getTime() - moscowOffset * 60_000)

  const nextResetMoscow = new Date(todayStartMoscow)
  nextResetMoscow.setDate(nextResetMoscow.getDate() + 1)
  const nextResetUtc = new Date(nextResetMoscow.getTime() - moscowOffset * 60_000)

  return { todayStart: todayStartUtc, nextReset: nextResetUtc }
}

export async function getRemainingCredits(
  prisma: PrismaClient,
  userId: string,
): Promise<{ remaining: number; nextReset: Date; dailyLimit: number }> {
  const { todayStart, nextReset } = getMoscowMidnight()

  const [calculationsToday, user] = await Promise.all([
    prisma.calculation.count({
      where: {
        userId,
        createdAt: { gte: todayStart },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { dailyLimit: true },
    }),
  ])

  const dailyLimit = user?.dailyLimit ?? FREE_CALCULATIONS_LIMIT
  const remaining = Math.max(0, dailyLimit - calculationsToday)

  return { remaining, nextReset, dailyLimit }
}

export async function logUsage(
  prisma: PrismaClient,
  userId: string,
  action: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await prisma.usageLog.create({
    data: {
      userId,
      action,
      metadata,
    },
  })
}
