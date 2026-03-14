import { Worker, type Job } from 'bullmq'
import type { PrismaClient } from '@razbor/db'
import { AvitoListingsFetcher } from '../providers/avito-http.js'
import {
  buildRegionUrls,
  buildDamagedRegionUrls,
} from '../crawler/avito-region-urls.js'
import { type ListingCard, isFromRegion } from '../crawler/listing-parser.js'
import { extractListingData } from '../matcher/title-parser.js'
import { detectDamaged } from '../matcher/damage-detector.js'
import { matchToGeneration } from '../matcher/generation-matcher.js'
import { estimateDismantling } from '../matcher/estimate-service.js'
import { filterNewRegion, markSeenRegion, replaceSeenRegion } from '../storage/region-deduplicator.js'
import { saveListings } from '../storage/listings-storage.js'
import { redis, createBullConnection } from '../storage/redis.js'
import { config } from '../config.js'
import { randomDelay } from '../utils/delay.js'
import { createLogger } from '../logger/index.js'
import { writeMonitorLog } from '../storage/monitor-log.js'

const logger = createLogger('region-crawler-worker')

export interface RegionCrawlJobData {
  regionSlug: string
  mode: 'quick' | 'deep'
}

export interface RegionCrawlResult {
  totalCards: number
  newCards: number
  saved: number
  deletedOld?: number
}

interface EnrichedListingCard {
  extId: string
  regionSlug: string
  title: string
  brand: string
  model: string
  engineVolume: string
  transmission: string
  price: number
  year: number | null
  url: string
  city: string
  imageUrl: string
  publishedAt: Date
  sellerType: string
  mileage: number | null
  isDamaged: boolean
  generationId: string | null
  configGroups: string
  estimateMin: number | null
  estimateMax: number | null
  estimateAvg: number | null
  estimateExact: boolean
  profit: number | null
}

let fetcher: AvitoListingsFetcher | null = null

function getFetcher(): AvitoListingsFetcher {
  if (!fetcher) fetcher = new AvitoListingsFetcher()
  return fetcher
}

function resetFetcher(): void {
  getFetcher().resetLimits()
}

export function destroyRegionFetcher(): void {
  if (fetcher) {
    fetcher.destroy()
    fetcher = null
  }
}

interface UnmatchedEntry {
  extId: string
  regionSlug: string
  title: string
  brand: string
  model: string
  year: number | null
  price: number
  reason: string
}

async function saveUnmatched(entries: UnmatchedEntry[], prisma: PrismaClient): Promise<void> {
  if (entries.length === 0) return
  for (const entry of entries) {
    try {
      await prisma.unmatchedListing.upsert({
        where: { extId_regionSlug: { extId: entry.extId, regionSlug: entry.regionSlug } },
        create: entry,
        update: { title: entry.title, price: entry.price, reason: entry.reason },
      })
    } catch {
      // ignore duplicates
    }
  }
}

async function enrichCards(
  cards: ListingCard[],
  prisma: PrismaClient,
  regionSlug: string,
): Promise<EnrichedListingCard[]> {
  const enriched: EnrichedListingCard[] = []
  const unmatched: UnmatchedEntry[] = []

  const genCache = new Map<string, { generationId: string } | null>()

  for (const card of cards) {
    const parsed = extractListingData(card.title)
    if (!parsed.brand) {
      unmatched.push({ extId: card.extId, regionSlug, title: card.title, brand: '', model: '', year: parsed.year ?? card.year, price: card.price, reason: 'BRAND_NOT_PARSED' })
      continue
    }

    const brandSlug = parsed.brand
    const modelSlug = parsed.model
    if (!modelSlug) {
      unmatched.push({ extId: card.extId, regionSlug, title: card.title, brand: brandSlug, model: '', year: parsed.year ?? card.year, price: card.price, reason: 'MODEL_NOT_MAPPED' })
      continue
    }

    const isDamaged = detectDamaged(card.rawItem ?? {}, card.title)

    const year = parsed.year ?? card.year

    const genKey = `${brandSlug}:${modelSlug}:${year ?? 'null'}`
    if (!genCache.has(genKey)) {
      genCache.set(
        genKey,
        year ? await matchToGeneration(brandSlug, modelSlug, year, prisma) : null,
      )
    }
    const genMatch = genCache.get(genKey) ?? null

    if (!genMatch) {
      unmatched.push({ extId: card.extId, regionSlug, title: card.title, brand: brandSlug, model: modelSlug, year, price: card.price, reason: year ? 'GENERATION_NOT_FOUND' : 'NO_YEAR' })
    }

    let estimate = null
    if (genMatch) {
      estimate = await estimateDismantling(
        {
          generationId: genMatch.generationId,
          engineVolume: parsed.engineVolume,
          transmission: parsed.transmission,
          price: card.price,
        },
        prisma,
      )
    }

    enriched.push({
      extId: card.extId,
      regionSlug,
      title: card.title,
      brand: brandSlug,
      model: modelSlug,
      engineVolume: parsed.engineVolume ?? '',
      transmission: parsed.transmission ?? '',
      price: card.price,
      year,
      url: card.url,
      city: card.city,
      imageUrl: card.imageUrl,
      publishedAt: card.publishedAt ? new Date(card.publishedAt) : new Date(),
      sellerType: card.sellerType,
      mileage: card.mileage,
      isDamaged,
      generationId: genMatch?.generationId ?? null,
      configGroups: estimate?.configGroups ?? '',
      estimateMin: estimate?.estimateMin ?? null,
      estimateMax: estimate?.estimateMax ?? null,
      estimateAvg: estimate?.estimateAvg ?? null,
      estimateExact: estimate?.estimateExact ?? false,
      profit: estimate?.profit ?? null,
    })
  }

  await saveUnmatched(unmatched, prisma)

  return enriched
}

async function processQuickCrawl(
  regionSlug: string,
  prisma: PrismaClient,
): Promise<RegionCrawlResult> {
  const f = getFetcher()
  const regularUrls = buildRegionUrls(regionSlug, 1)
  const damagedUrls = buildDamagedRegionUrls(regionSlug, 1)

  const allCards: ListingCard[] = []

  for (const url of [...regularUrls, ...damagedUrls]) {
    const result = await f.fetch(url)

    if (result.blocked) {
      logger.warn({ regionSlug, url }, 'Blocked during quick crawl')
      continue
    }

    allCards.push(...result.cards)
    await randomDelay(1000, 3000)
  }

  if (allCards.length === 0) {
    return { totalCards: 0, newCards: 0, saved: 0 }
  }

  const deduped = [...new Map(allCards.map(c => [c.extId, c])).values()]
  const uniqueCards = deduped.filter(c => isFromRegion(c.url, regionSlug))
  const extIds = uniqueCards.map((c) => c.extId)

  const newExtIds = await filterNewRegion(regionSlug, extIds, redis)
  if (newExtIds.length === 0) {
    return { totalCards: extIds.length, newCards: 0, saved: 0 }
  }

  const newExtIdSet = new Set(newExtIds)
  const cardsToProcess = uniqueCards.filter((c) => newExtIdSet.has(c.extId))

  const enrichedCards = await enrichCards(cardsToProcess, prisma, regionSlug)
  const saved = await saveListings(regionSlug, enrichedCards, prisma)

  await markSeenRegion(regionSlug, newExtIds, redis)

  return { totalCards: extIds.length, newCards: newExtIds.length, saved }
}

async function processDeepCrawl(
  regionSlug: string,
  prisma: PrismaClient,
): Promise<RegionCrawlResult> {
  const maxPages = config.regionCrawl.deepCrawlPages
  const f = getFetcher()

  const allCards: ListingCard[] = []

  for (let page = 1; page <= maxPages; page++) {
    const regularUrls = buildRegionUrls(regionSlug, page)
    const damagedUrls = buildDamagedRegionUrls(regionSlug, page)

    for (const url of [...regularUrls, ...damagedUrls]) {
      const result = await f.fetch(url)

      if (result.blocked) {
        logger.warn({ regionSlug, page, url }, 'Blocked during deep crawl')
        continue
      }

      allCards.push(...result.cards)
      await randomDelay(1000, 3000)
    }

    if (page < maxPages) {
      await randomDelay(2000, 5000)
    }
  }

  const deduped = [...new Map(allCards.map(c => [c.extId, c])).values()]
  const uniqueCards = deduped.filter(c => isFromRegion(c.url, regionSlug))

  if (uniqueCards.length < deduped.length) {
    logger.info({ regionSlug, filtered: deduped.length - uniqueCards.length }, 'Filtered foreign region listings')
  }

  const MIN_CARDS_GUARD = 50
  if (uniqueCards.length < MIN_CARDS_GUARD) {
    logger.warn({ regionSlug, found: uniqueCards.length }, 'Too few cards found, skipping region replace')
    return { totalCards: uniqueCards.length, newCards: 0, saved: 0 }
  }

  const enrichedCards = await enrichCards(uniqueCards, prisma, regionSlug)

  const saved = await saveListings(regionSlug, enrichedCards, prisma)

  const freshExtIds = uniqueCards.map((c) => c.extId)
  let deletedOld = 0
  if (saved > 0) {
    const result = await prisma.monitorListing.deleteMany({
      where: { regionSlug, extId: { notIn: freshExtIds } },
    })
    deletedOld = result.count
    logger.info({ regionSlug, deletedOld }, 'Removed stale listings not found in deep crawl')
  }

  await replaceSeenRegion(regionSlug, freshExtIds, redis)

  return { totalCards: uniqueCards.length, newCards: uniqueCards.length, saved, deletedOld }
}

async function processRegionCrawl(
  job: Job<RegionCrawlJobData>,
  prisma: PrismaClient,
): Promise<RegionCrawlResult> {
  const { regionSlug, mode } = job.data
  if (mode === 'deep') return processDeepCrawl(regionSlug, prisma)
  return processQuickCrawl(regionSlug, prisma)
}

export function createRegionCrawlerWorker(
  prisma: PrismaClient,
): Worker<RegionCrawlJobData> {
  const worker = new Worker<RegionCrawlJobData>(
    'region-crawl',
    async (job: Job<RegionCrawlJobData>) => {
      const { regionSlug, mode } = job.data

      logger.info({ regionSlug, mode }, 'Region crawl start')

      resetFetcher()
      const result = await processRegionCrawl(job, prisma)

      logger.info(
        {
          regionSlug,
          mode,
          totalCards: result.totalCards,
          newCards: result.newCards,
          saved: result.saved,
        },
        'Region crawl done',
      )

      const deletedInfo = result.deletedOld != null ? `, ${result.deletedOld} удалено` : ''
      writeMonitorLog({
        type: 'CRAWL',
        level: 'INFO',
        message: `[${regionSlug}] ${mode}: ${result.totalCards} найдено, ${result.saved} сохранено${deletedInfo}`,
        meta: { regionSlug, mode, ...result },
      })

      return result
    },
    {
      connection: createBullConnection(),
      concurrency: 1,
      limiter: { max: 1, duration: 3000 },
    },
  )

  worker.on('failed', (job: Job<RegionCrawlJobData> | undefined, err: Error) => {
    logger.error(
      { jobId: job?.id, regionSlug: job?.data.regionSlug, err: err.message },
      'Region crawl job failed',
    )
    writeMonitorLog({
      type: 'CRAWL',
      level: 'ERROR',
      message: `[${job?.data.regionSlug}] ${job?.data.mode} failed: ${err.message}`,
      meta: { regionSlug: job?.data.regionSlug, mode: job?.data.mode, jobId: job?.id },
    })
  })

  return worker
}
