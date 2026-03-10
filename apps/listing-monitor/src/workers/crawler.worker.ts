import { Worker, Queue, type Job } from 'bullmq'
import {
  crawlAvitoListings,
  resetFetcher,
  type CrawlParams,
} from '../crawler/avito-listings.js'
import { filterNew, markAllSeen } from '../storage/deduplicator.js'
import { type SubscriptionMatcher } from '../matcher/subscription-matcher.js'
import { type ListingCard } from '../crawler/listing-parser.js'
import { sendAdminAlert } from '../notifier/telegram.js'
import { createLogger } from '../logger/index.js'
import { redis, createBullConnection } from '../storage/redis.js'
import { writeMonitorLog } from '../storage/monitor-log.js'

const logger = createLogger('crawler-worker')

export interface CrawlJobData extends CrawlParams {
  groupKey: string
}

export interface NotifyJobData {
  telegramId: string
  cards: ListingCard[]
  subscriptionId: string
  subscriptionLabel: string
}

export function createCrawlerWorker(
  notifyQueue: Queue<NotifyJobData>,
  matcher: SubscriptionMatcher,
): Worker<CrawlJobData> {
  const worker = new Worker<CrawlJobData>(
    'crawl',
    async (job: Job<CrawlJobData>) => {
      const {
        brandSlug,
        modelSlug,
        city,
        groupKey,
        ...filters
      } = job.data

      const isFirstRun = !(await redis.exists(`initialized:${groupKey}`))

      logger.info(`[${groupKey}] Crawl start (firstRun=${isFirstRun})`)

      resetFetcher()
      const result = await crawlAvitoListings({
        brandSlug,
        modelSlug,
        city,
        ...filters,
      })

      if (result.notFound) {
        logger.error(`[${groupKey}] 404 — невалидный URL: ${result.url}`)
        await sendAdminAlert(`404 — страница не найдена\nГруппа: ${groupKey}\nURL: ${result.url}`)
        writeMonitorLog({
          type: 'CRAWL',
          level: 'ERROR',
          brandSlug,
          modelSlug,
          message: `404 — невалидный URL`,
          meta: { groupKey, url: result.url },
        })
        return { blocked: false, cards: 0, newCards: 0, notFound: true }
      }

      if (result.blocked) {
        logger.warn(`[${groupKey}] BLOCKED (${result.strategy})`)
        writeMonitorLog({
          type: 'CRAWL',
          level: 'WARN',
          brandSlug,
          modelSlug,
          message: `BLOCKED (${result.strategy})`,
          meta: { groupKey, strategy: result.strategy },
        })
        return { blocked: true, cards: 0, newCards: 0 }
      }

      if (result.cards.length === 0) {
        const emptyKey = `empty-streak:${groupKey}`
        const streak = await redis.incr(emptyKey)
        await redis.expire(emptyKey, 3600)

        logger.warn(`[${groupKey}] 0 объявлений (${streak} подряд), url: ${result.url}`)

        if (streak === 3) {
          await sendAdminAlert(`0 объявлений 3 раза подряд — возможно невалидный URL\nГруппа: ${groupKey}\nURL: ${result.url}`)
        }
        if (streak >= 3) {
          writeMonitorLog({
            type: 'CRAWL',
            level: 'WARN',
            brandSlug,
            modelSlug,
            message: `0 объявлений ${streak} раз подряд`,
            meta: { groupKey, url: result.url, streak },
          })
        }
        return { blocked: false, cards: 0, newCards: 0 }
      }

      await redis.del(`empty-streak:${groupKey}`)

      if (isFirstRun) {
        await markAllSeen(brandSlug, modelSlug, result.cards)
        await redis.set(`initialized:${groupKey}`, '1', 'EX', 2592000)

        await matcher.ensureFresh()

        const notifyMap = new Map<
          string,
          {
            telegramId: string
            cards: ListingCard[]
            subscriptionId: string
            subscriptionLabel: string
          }
        >()
        const sentToUser = new Set<string>()

        for (const card of result.cards) {
          if (!card.publishedAt) continue
          const publishedAt = new Date(card.publishedAt).getTime()
          if (isNaN(publishedAt)) continue

          const matches = matcher.match(card, brandSlug, modelSlug)
          for (const match of matches) {
            if (publishedAt <= match.createdAt.getTime()) continue

            const userCardKey = `${match.telegramId}:${card.extId}`
            if (sentToUser.has(userCardKey)) continue
            sentToUser.add(userCardKey)

            const key = `${match.telegramId}:${match.subscriptionId}`
            const existing = notifyMap.get(key)
            if (existing) {
              existing.cards.push(card)
            } else {
              notifyMap.set(key, {
                telegramId: match.telegramId,
                cards: [card],
                subscriptionId: match.subscriptionId,
                subscriptionLabel: match.label,
              })
            }
          }
        }

        for (const [, data] of notifyMap) {
          await notifyQueue.add('notify', {
            telegramId: data.telegramId,
            cards: data.cards,
            subscriptionId: data.subscriptionId,
            subscriptionLabel: data.subscriptionLabel,
          })
        }

        const notifiedCards = [...notifyMap.values()].reduce((sum, d) => sum + d.cards.length, 0)

        logger.info(
          `[${groupKey}] First run done: ${result.cards.length} seen, ${notifiedCards} new after subscription creation`,
        )
        writeMonitorLog({
          type: 'CRAWL',
          level: 'INFO',
          brandSlug,
          modelSlug,
          message: `First run done: ${result.cards.length} seen, ${notifiedCards} new`,
          meta: { groupKey, totalCards: result.cards.length, notifiedCards },
        })
        await redis.set(`lastCrawl:${groupKey}`, String(Date.now()), 'EX', 604800)
        return { blocked: false, cards: result.cards.length, newCards: notifiedCards }
      }

      const newCards = await filterNew(brandSlug, modelSlug, result.cards)

      if (newCards.length > 0) {
        logger.info(
          `[${groupKey}] Новые: ${newCards.map((c) => `${c.extId}(${c.publishedAt || 'no-date'})`).join(', ')}`,
        )
      }

      const CRAWL_TIME_BUFFER_MS = 16 * 60 * 1000
      const maxAgeMs = 24 * 60 * 60 * 1000
      const now = Date.now()

      const lastCrawlRaw = await redis.get(`lastCrawl:${groupKey}`)
      const lastCrawlTime = lastCrawlRaw ? parseInt(lastCrawlRaw, 10) : 0

      if (lastCrawlTime === 0) {
        logger.warn(`[${groupKey}] lastCrawl key missing, using maxAge filter only`)
      }

      const freshCards = newCards.filter((card) => {
        if (!card.publishedAt) return false
        const published = new Date(card.publishedAt).getTime()
        if (isNaN(published)) return false
        if (now - published >= maxAgeMs) return false
        if (lastCrawlTime > 0 && published < lastCrawlTime - CRAWL_TIME_BUFFER_MS) return false
        return true
      })

      if (freshCards.length !== newCards.length) {
        logger.info(
          `[${groupKey}] Отфильтровано старых: ${newCards.length - freshCards.length} из ${newCards.length}`,
        )
      }

      if (freshCards.length === 0) {
        logger.info(`[${groupKey}] Нет новых (всего ${result.cards.length})`)
        await redis.set(`lastCrawl:${groupKey}`, String(now), 'EX', 604800)
        writeMonitorLog({
          type: 'CRAWL',
          level: 'INFO',
          brandSlug,
          modelSlug,
          message: `Crawl done: ${result.cards.length} total, 0 new, 0 notifications`,
          meta: { groupKey, totalCards: result.cards.length, newCards: 0, notifications: 0 },
        })
        return { blocked: false, cards: result.cards.length, newCards: 0 }
      }

      await matcher.ensureFresh()

      const notifyMap = new Map<
        string,
        {
          telegramId: string
          cards: ListingCard[]
          subscriptionId: string
          subscriptionLabel: string
        }
      >()
      const sentToUser = new Set<string>()

      for (const card of freshCards) {
        const matches = matcher.match(card, brandSlug, modelSlug)
        for (const match of matches) {
          if (card.publishedAt) {
            const publishedAt = new Date(card.publishedAt).getTime()
            if (!isNaN(publishedAt) && publishedAt <= match.createdAt.getTime()) continue
          }

          const userCardKey = `${match.telegramId}:${card.extId}`
          if (sentToUser.has(userCardKey)) continue
          sentToUser.add(userCardKey)

          const key = `${match.telegramId}:${match.subscriptionId}`
          const existing = notifyMap.get(key)
          if (existing) {
            existing.cards.push(card)
          } else {
            notifyMap.set(key, {
              telegramId: match.telegramId,
              cards: [card],
              subscriptionId: match.subscriptionId,
              subscriptionLabel: match.label,
            })
          }
        }
      }

      for (const [, data] of notifyMap) {
        await notifyQueue.add('notify', {
          telegramId: data.telegramId,
          cards: data.cards,
          subscriptionId: data.subscriptionId,
          subscriptionLabel: data.subscriptionLabel,
        })
      }

      logger.info(
        `[${groupKey}] Crawl done: ${result.cards.length} total, ${freshCards.length} new, ${notifyMap.size} notifications`,
      )
      await redis.set(`lastCrawl:${groupKey}`, String(now), 'EX', 604800)

      writeMonitorLog({
        type: 'CRAWL',
        level: 'INFO',
        brandSlug,
        modelSlug,
        message: `Crawl done: ${result.cards.length} total, ${freshCards.length} new, ${notifyMap.size} notifications`,
        meta: { groupKey, totalCards: result.cards.length, newCards: freshCards.length, notifications: notifyMap.size },
      })
      return {
        blocked: false,
        cards: result.cards.length,
        newCards: freshCards.length,
      }
    },
    {
      connection: createBullConnection(),
      concurrency: 1,
      limiter: { max: 1, duration: 1500 },
    },
  )

  worker.on('failed', (job: Job<CrawlJobData> | undefined, err: Error) => {
    logger.error(
      { jobId: job?.id, groupKey: job?.data.groupKey, err: err.message },
      'Crawl job failed',
    )
    writeMonitorLog({
      type: 'CRAWL',
      level: 'ERROR',
      brandSlug: job?.data.brandSlug,
      modelSlug: job?.data.modelSlug,
      message: `Crawl failed: ${err.message}`,
      meta: { groupKey: job?.data.groupKey, jobId: job?.id },
    })
  })

  return worker
}
