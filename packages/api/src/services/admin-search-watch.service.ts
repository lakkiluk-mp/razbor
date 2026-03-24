import type { PrismaClient, AdminSearchWatch } from '@razbor/db'
import type Redis from 'ioredis'
import { GraphQLError } from 'graphql'
import { ADMIN_SEARCH_WATCH_CHANNEL } from '@razbor/shared'

async function publishEvent(redis: Redis | null, action: string, watchId: string): Promise<void> {
  if (!redis) return
  try {
    await redis.publish(ADMIN_SEARCH_WATCH_CHANNEL, JSON.stringify({ action, watchId }))
  } catch (err) {
    console.error('[AdminSearchWatch] Failed to publish Redis event:', err)
  }
}

export async function createAdminSearchWatch(
  prisma: PrismaClient,
  redis: Redis | null,
  userId: string,
  input: { label: string; url: string },
): Promise<AdminSearchWatch> {
  try {
    const parsed = new URL(input.url)
    if (parsed.hostname !== 'www.avito.ru' && parsed.hostname !== 'avito.ru') {
      throw new Error()
    }
  } catch {
    throw new GraphQLError('URL должен быть ссылкой на avito.ru', {
      extensions: { code: 'INVALID_INPUT' },
    })
  }

  const watch = await prisma.adminSearchWatch.create({
    data: {
      userId,
      label: input.label,
      url: input.url,
    },
  })

  await publishEvent(redis, 'created', watch.id)
  return watch
}

export async function deleteAdminSearchWatch(
  prisma: PrismaClient,
  redis: Redis | null,
  id: string,
): Promise<void> {
  await prisma.adminSearchWatch.delete({ where: { id } })

  if (redis) {
    await redis.del(`seen:admin-watch:${id}`, `initialized:admin-watch:${id}`)
  }

  await publishEvent(redis, 'deleted', id)
}

export async function toggleAdminSearchWatch(
  prisma: PrismaClient,
  redis: Redis | null,
  id: string,
): Promise<AdminSearchWatch> {
  const watch = await prisma.$transaction(async (tx) => {
    const existing = await tx.adminSearchWatch.findUnique({ where: { id } })
    if (!existing) {
      throw new GraphQLError('Watch не найден', {
        extensions: { code: 'NOT_FOUND' },
      })
    }

    return tx.adminSearchWatch.update({
      where: { id },
      data: { isActive: !existing.isActive },
    })
  })

  await publishEvent(redis, watch.isActive ? 'resumed' : 'paused', watch.id)
  return watch
}
