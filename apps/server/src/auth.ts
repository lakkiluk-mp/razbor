import { validate, parse } from '@telegram-apps/init-data-node'
import type { PrismaClient } from '@razbor/db'

const BOT_TOKEN = process.env.BOT_TOKEN ?? ''
const AUTH_CACHE_TTL = 5 * 60 * 1000

type CachedUser = { id: string; telegramId: bigint; username: string | null }

const userCache = new Map<string, { user: CachedUser; expiresAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of userCache) {
    if (entry.expiresAt <= now) userCache.delete(key)
  }
}, 60_000).unref()

export async function authenticateUser(
  initDataRaw: string,
  prisma: PrismaClient,
): Promise<CachedUser | null> {
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

  const { id: tgId, firstName, lastName, username } = parsed.user
  const cacheKey = String(tgId)
  const now = Date.now()

  const cached = userCache.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    return cached.user
  }

  const user = await prisma.user.upsert({
    where: { telegramId: BigInt(tgId) },
    create: {
      telegramId: BigInt(tgId),
      firstName: firstName ?? '',
      lastName: lastName ?? null,
      username: username ?? null,
      isPremium: false,
    },
    update: {
      firstName: firstName ?? '',
      lastName: lastName ?? null,
      username: username ?? null,
    },
    select: { id: true, telegramId: true, username: true },
  })

  userCache.set(cacheKey, { user, expiresAt: now + AUTH_CACHE_TTL })

  return user
}
