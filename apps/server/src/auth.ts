import { validate, parse } from '@telegram-apps/init-data-node'
import type { PrismaClient } from '@razbor/db'

const BOT_TOKEN = process.env.BOT_TOKEN ?? ''

export async function authenticateUser(
  initDataRaw: string,
  prisma: PrismaClient,
): Promise<{ id: string; telegramId: bigint } | null> {
  if (!BOT_TOKEN) {
    return null
  }

  try {
    validate(initDataRaw, BOT_TOKEN, { expiresIn: 86400 })
  } catch {
    return null
  }

  const parsed = parse(initDataRaw)

  if (!parsed.user) {
    return null
  }

  const { id: tgId, firstName, lastName, username, isPremium } = parsed.user

  const user = await prisma.user.upsert({
    where: { telegramId: BigInt(tgId) },
    create: {
      telegramId: BigInt(tgId),
      firstName: firstName ?? '',
      lastName: lastName ?? null,
      username: username ?? null,
      isPremium: isPremium ?? false,
    },
    update: {
      firstName: firstName ?? '',
      lastName: lastName ?? null,
      username: username ?? null,
      isPremium: isPremium ?? false,
    },
    select: { id: true, telegramId: true },
  })

  return user
}
