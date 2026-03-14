import type Redis from 'ioredis'
import { config } from '../config.js'
import { createLogger } from '../logger/index.js'

const logger = createLogger('region-deduplicator')

function getKey(regionSlug: string): string {
  return `seen:region:${regionSlug}`
}

export async function filterNewRegion(
  regionSlug: string,
  extIds: string[],
  redis: Redis,
): Promise<string[]> {
  if (extIds.length === 0) return []

  try {
    const key = getKey(regionSlug)
    const pipeline = redis.pipeline()

    for (const extId of extIds) {
      pipeline.sismember(key, extId)
    }

    const results = await pipeline.exec()
    const newIds: string[] = []

    if (results) {
      for (let i = 0; i < results.length; i++) {
        const [err, isMember] = results[i]
        if (!err && isMember === 0) newIds.push(extIds[i])
      }
    }

    logger.debug(
      { region: regionSlug, total: extIds.length, new: newIds.length },
      'Region dedup result',
    )

    return newIds
  } catch (error) {
    logger.error({ region: regionSlug, error }, 'Region dedup failed, treating all as new')
    return extIds
  }
}

export async function replaceSeenRegion(
  regionSlug: string,
  extIds: string[],
  redis: Redis,
): Promise<void> {
  if (extIds.length === 0) return

  try {
    const key = getKey(regionSlug)

    const pipeline = redis.pipeline()
    pipeline.del(key)
    pipeline.sadd(key, ...extIds)
    pipeline.expire(key, config.monitor.dedupTtlSeconds)
    await pipeline.exec()

    logger.info(
      { region: regionSlug, count: extIds.length },
      'Region: dedup set replaced',
    )
  } catch (error) {
    logger.error({ region: regionSlug, error }, 'Region replaceSeenRegion failed')
  }
}

export async function markSeenRegion(
  regionSlug: string,
  extIds: string[],
  redis: Redis,
): Promise<void> {
  if (extIds.length === 0) return

  try {
    const key = getKey(regionSlug)

    const pipeline = redis.pipeline()
    pipeline.sadd(key, ...extIds)
    pipeline.expire(key, config.monitor.dedupTtlSeconds)
    await pipeline.exec()

    logger.info(
      { region: regionSlug, count: extIds.length },
      'Region: marked as seen',
    )
  } catch (error) {
    logger.error({ region: regionSlug, error }, 'Region markSeen failed')
  }
}
