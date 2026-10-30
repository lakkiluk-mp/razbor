import { Worker, type Job } from 'bullmq'
import { DemoListingsFetcher } from '../providers/demo-listings-fetcher.js'
import { type ListingCard } from '../crawler/listing-card.js'
import { sendListing } from '../notifier/telegram.js'
import { redis, createBullConnection } from '../storage/redis.js'
import { prisma } from '../storage/prisma.js'
import { config } from '../config.js'
import { createLogger } from '../logger/index.js'

const logger = createLogger('admin-search-watch-worker')

export interface AdminSearchWatchJobData {
  watchId: string
  url: string
  label: string
  telegramId: string
}

let fetcher: DemoListingsFetcher | null = null

function getFetcher(): DemoListingsFetcher {
  if (!fetcher) fetcher = new DemoListingsFetcher()
  return fetcher
}

async function filterNewCards(watchId: string, cards: ListingCard[]): Promise<ListingCard[]> {
  if (cards.length === 0) return []

  const key = `seen:admin-watch:${watchId}`
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
  return newCards
}

async function markAllSeen(watchId: string, cards: ListingCard[]): Promise<void> {
  if (cards.length === 0) return

  const key = `seen:admin-watch:${watchId}`
  const extIds = cards.map((c) => c.extId)
  await redis.sadd(key, ...extIds)
  await redis.expire(key, config.monitor.dedupTtlSeconds)
}

export function createAdminSearchWatchWorker(): Worker<AdminSearchWatchJobData> {
  const worker = new Worker<AdminSearchWatchJobData>(
    'admin-search-watch',
    async (job: Job<AdminSearchWatchJobData>) => {
      const { watchId, url, label, telegramId } = job.data

      logger.info({ watchId, label }, 'Processing admin search watch')

      const f = getFetcher()
      f.resetLimits()
      const result = await f.fetch(url)

      if (result.blocked) {
        logger.warn({ watchId }, 'Blocked while fetching admin search watch')
        return
      }

      const initKey = `initialized:admin-watch:${watchId}`
      const isFirstRun = !(await redis.exists(initKey))

      if (isFirstRun) {
        await markAllSeen(watchId, result.cards)
        await redis.set(initKey, '1', 'EX', 2592000)
        logger.info({ watchId, seen: result.cards.length }, 'First run, marked all as seen')

        await prisma.adminSearchWatch.update({
          where: { id: watchId },
          data: { lastCrawledAt: new Date() },
        })
        return
      }

      const newCards = await filterNewCards(watchId, result.cards)

      logger.info({ watchId, total: result.cards.length, new: newCards.length }, 'Crawl result')

      let sentCount = 0
      for (const card of newCards) {
        const sendResult = await sendListing(telegramId, card, label)
        if (sendResult.sent) sentCount++
      }

      await prisma.adminSearchWatch.update({
        where: { id: watchId },
        data: {
          lastCrawledAt: new Date(),
          ...(sentCount > 0
            ? {
                notificationsSent: { increment: sentCount },
                lastNotifiedAt: new Date(),
              }
            : {}),
        },
      })
    },
    {
      connection: createBullConnection(),
      concurrency: 1,
      limiter: { max: 1, duration: 2000 },
    },
  )

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, 'Admin search watch job failed')
  })

  return worker
}

export async function destroyAdminWatchFetcher(): Promise<void> {
  if (fetcher) {
    await fetcher.destroy()
    fetcher = null
  }
}
