import type { PrismaClient, Prisma } from '@razbor/db'
import { FREE_CALCULATIONS_LIMIT } from '@razbor/shared'

type PrismaTransactionClient = Prisma.TransactionClient | PrismaClient

export async function getRemainingCredits(
  prisma: PrismaTransactionClient,
  userId: string,
): Promise<{ remaining: number; oldestCalcAt: Date | null }> {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const [calculationsIn24h, oldestCalc] = await Promise.all([
    prisma.calculation.count({
      where: {
        userId,
        createdAt: { gte: oneDayAgo },
      },
    }),
    prisma.calculation.findFirst({
      where: {
        userId,
        createdAt: { gte: oneDayAgo },
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    }),
  ])

  const remaining = Math.max(0, FREE_CALCULATIONS_LIMIT - calculationsIn24h)

  return {
    remaining,
    oldestCalcAt: oldestCalc?.createdAt ?? null,
  }
}
