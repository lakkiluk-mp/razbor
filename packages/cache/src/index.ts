import { getRedis } from './client'

export { getRedis } from './client'

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis()
    if (!redis) return null
    const data = await redis.get(key)
    if (!data) return null
    return JSON.parse(data) as T
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const redis = getRedis()
    if (!redis) return
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  } catch {}
}

export async function cacheInvalidate(pattern: string): Promise<void> {
  try {
    const redis = getRedis()
    if (!redis) return
    const stream = redis.scanStream({ match: pattern, count: 100 })
    const toDelete: string[] = []
    for await (const keys of stream) {
      toDelete.push(...(keys as string[]))
    }
    if (toDelete.length > 0) {
      await redis.del(...toDelete)
    }
  } catch {}
}

export async function invalidateGenerationCache(generationId: string): Promise<void> {
  await cacheInvalidate(`gen:*:${generationId}`)
}

export async function invalidateCatalogCache(): Promise<void> {
  await cacheInvalidate('gen:*')
}
