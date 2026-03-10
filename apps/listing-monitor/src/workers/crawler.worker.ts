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
  isFirstRun?: boolean
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

        const sorted = [...result.cards]
          .filter((c) => c.publishedAt)
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        const candidates = sorted.length > 0 ? sorted : result.cards

        await matcher.ensureFresh()

        let notifiedCount = 0
        for (const card of candidates) {
          const matches = matcher.match(card, brandSlug, modelSlug)
          if (matches.length > 0) {
            logger.info(
              `[${groupKey}] First run: отправляем extId=${card.extId}, ${card.title}, publishedAt=${card.publishedAt}`,
            )
            for (const match of matches) {
              await notifyQueue.add('notify', {
                telegramId: match.telegramId,
                cards: [card],
                subscriptionId: match.subscriptionId,
                subscriptionLabel: match.label,
                isFirstRun: true,
              })
            }
            notifiedCount = matches.length
            break
          }
        }

        if (notifiedCount === 0) {
          logger.warn(`[${groupKey}] First run: ни одна карточка не подошла под фильтры (${result.cards.length} всего)`)
        }

        await redis.set(`initialized:${groupKey}`, '1', 'EX', 2592000)

        logger.info(
          `[${groupKey}] First run done: ${result.cards.length} seen, ${notifiedCount} notified`,
        )
        writeMonitorLog({
          type: 'CRAWL',
          level: 'INFO',
          brandSlug,
          modelSlug,
          message: `First run done: ${result.cards.length} seen, ${notifiedCount} notified`,
          meta: { groupKey, totalCards: result.cards.length, notifiedCount },
        })
        return { blocked: false, cards: result.cards.length, newCards: notifiedCount > 0 ? 1 : 0 }
      }

      const newCards = await filterNew(brandSlug, modelSlug, result.cards)

      if (newCards.length > 0) {
        logger.info(
          `[${groupKey}] Новые: ${newCards.map((c) => `${c.extId}(${c.publishedAt || 'no-date'})`).join(', ')}`,
        )
      }

      const maxAgeMs = 24 * 60 * 60 * 1000
      const now = Date.now()
      const freshCards = newCards.filter((card) => {
        if (!card.publishedAt) return false
        const published = new Date(card.publishedAt).getTime()
        return !isNaN(published) && now - published < maxAgeMs
      })

      if (freshCards.length !== newCards.length) {
        logger.info(
          `[${groupKey}] Отфильтровано старых: ${newCards.length - freshCards.length} из ${newCards.length}`,
        )
      }

      if (freshCards.length === 0) {
        logger.info(`[${groupKey}] Нет новых (всего ${result.cards.length})`)
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
        newCards: newCards.length,
      }
    },
    {
      connection: createBullConnection(),
      concurrency: 1,
      limiter: { max: 1, duration: 3000 },
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
