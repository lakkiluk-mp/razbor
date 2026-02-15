import type { PrismaClient } from '@razbor/db'
import type { InputJsonValue } from '@prisma/client/runtime/library'

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
      metadata: metadata as InputJsonValue,
    },
  })
}
