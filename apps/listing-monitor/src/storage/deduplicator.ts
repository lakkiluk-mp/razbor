import { redis } from './redis.js'
import { config } from '../config.js'
import { type ListingCard } from '../crawler/listing-card.js'
import { createLogger } from '../logger/index.js'

const logger = createLogger('deduplicator')

function getKey(brandSlug: string, modelSlug: string): string {
  return `seen:${brandSlug}:${modelSlug}`
}

export async function filterNew(
  brandSlug: string,
  modelSlug: string,
  cards: ListingCard[],
): Promise<ListingCard[]> {
  if (cards.length === 0) return []

  const key = getKey(brandSlug, modelSlug)
  const pipeline = redis.pipeline()

  for (const card of cards) {
    pipeline.sadd(key, card.extId)
  }

  const results = await pipeline.exec()
  const newCards: ListingCard[] = []

  if (results) {
    for (let i = 0; i < results.length; i++) {
      const [err, added] = results[i]
      if (!err && added === 1) newCards.push(cards[i])
    }
  }

  await redis.expire(key, config.monitor.dedupTtlSeconds)

  logger.debug(
    { brand: brandSlug, model: modelSlug, total: cards.length, new: newCards.length },
    'Dedup result',
  )

  return newCards
}

export async function markAllSeen(
  brandSlug: string,
  modelSlug: string,
  cards: ListingCard[],
): Promise<void> {
  if (cards.length === 0) return

  const key = getKey(brandSlug, modelSlug)
  const extIds = cards.map(c => c.extId)

  await redis.sadd(key, ...extIds)
  await redis.expire(key, config.monitor.dedupTtlSeconds)

  logger.info(
    { brand: brandSlug, model: modelSlug, count: extIds.length },
    'Marked all as seen',
  )
}
