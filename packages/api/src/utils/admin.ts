import { GraphQLError } from 'graphql'
import type { Context } from '../schema/builder'

let cachedAdminIds: bigint[] | null = null

const getAdminTelegramIds = (): bigint[] => {
  if (cachedAdminIds !== null) return cachedAdminIds
  const raw = process.env.ADMIN_TELEGRAM_IDS
  if (!raw) {
    cachedAdminIds = []
    return cachedAdminIds
  }
  cachedAdminIds = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((s) => {
      try {
        return [BigInt(s)]
      } catch {
        return []
      }
    })
  return cachedAdminIds
}

export const isAdmin = (ctx: Context): boolean => {
  if (!ctx.user) return false
  const adminIds = getAdminTelegramIds()
  return adminIds.includes(ctx.user.telegramId)
}

export const assertAdmin = (ctx: Context): void => {
  if (!isAdmin(ctx)) {
    throw new GraphQLError('Forbidden')
  }
}
