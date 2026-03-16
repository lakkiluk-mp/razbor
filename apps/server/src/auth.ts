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
    validate(initDataRaw, BOT_TOKEN, { expiresIn: 43200 })
  } catch {
    return null
  }

  const parsed = parse(initDataRaw, true)

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

  let user = await prisma.user.findUnique({
    where: { telegramId: BigInt(tgId) },
    select: { id: true, telegramId: true, username: true, firstName: true, lastName: true },
  })

  const newFirstName = firstName ?? ''
  const newLastName = lastName ?? null
  const newUsername = username ?? null

  if (!user) {
    try {
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(tgId),
          firstName: newFirstName,
          lastName: newLastName,
          username: newUsername,
          isPremium: false,
        },
        select: { id: true, telegramId: true, username: true, firstName: true, lastName: true },
      })
    } catch {
      user = await prisma.user.findUnique({
        where: { telegramId: BigInt(tgId) },
        select: { id: true, telegramId: true, username: true, firstName: true, lastName: true },
      })
    }
  } else if (
    user.firstName !== newFirstName ||
    user.lastName !== newLastName ||
    user.username !== newUsername
  ) {
    user = await prisma.user.update({
      where: { telegramId: BigInt(tgId) },
      data: { firstName: newFirstName, lastName: newLastName, username: newUsername },
      select: { id: true, telegramId: true, username: true, firstName: true, lastName: true },
    })
  }

  userCache.set(cacheKey, { user, expiresAt: now + AUTH_CACHE_TTL })

  return user
}
