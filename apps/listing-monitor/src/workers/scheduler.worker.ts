import { Queue } from 'bullmq'
import { MONITOR_SUBSCRIPTIONS_CHANNEL } from '@razbor/shared'
import { SubscriptionMatcher, type CrawlGroup } from '../matcher/subscription-matcher.js'
import { redisSub } from '../storage/redis.js'
import { createLogger } from '../logger/index.js'
import { config } from '../config.js'
import { type CrawlJobData } from './crawler.worker.js'
import { writeMonitorLog, cleanupOldLogs } from '../storage/monitor-log.js'

const logger = createLogger('scheduler')

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MonitorScheduler {
  private crawlQueue: Queue<CrawlJobData>
  private matcher: SubscriptionMatcher
  private activeGroupKeys = new Set<string>()
  private lastCleanupAt: number = 0
  private isRunning = false
  private cyclePromise: Promise<void> | null = null

  constructor(crawlQueue: Queue<CrawlJobData>, matcher: SubscriptionMatcher) {
    this.crawlQueue = crawlQueue
    this.matcher = matcher
  }

  async start(): Promise<void> {
    logger.info('Starting scheduler...')

    await this.cleanupRepeatableJobs()
    await this.matcher.loadSubscriptions()
    this.refreshGroups()
    await this.subscribeToPubSub()

    this.isRunning = true
    this.cyclePromise = this.runContinuousLoop()

    logger.info({ groups: this.activeGroupKeys.size }, 'Scheduler started')
    writeMonitorLog({
      type: 'SYSTEM',
      level: 'INFO',
      message: `Scheduler started: ${this.activeGroupKeys.size} groups`,
      meta: { groups: this.activeGroupKeys.size },
    })
  }

  async stop(): Promise<void> {
    this.isRunning = false
    await redisSub.unsubscribe(MONITOR_SUBSCRIPTIONS_CHANNEL)

    if (this.cyclePromise) {
      await this.cyclePromise.catch(() => {})
    }

    this.activeGroupKeys.clear()
    logger.info('Scheduler stopped')
  }

  private async cleanupRepeatableJobs(): Promise<void> {
    const repeatableJobs = await this.crawlQueue.getRepeatableJobs()
    for (const job of repeatableJobs) {
      await this.crawlQueue.removeRepeatableByKey(job.key)
    }
    if (repeatableJobs.length > 0) {
      logger.info({ count: repeatableJobs.length }, 'Cleaned up old repeatable jobs')
    }
  }

  private refreshGroups(): void {
    const groups = this.matcher.getUniqueGroups()
    this.activeGroupKeys = new Set(groups.map((g) => this.buildGroupKey(g)))
  }

  private async runContinuousLoop(): Promise<void> {
    const CLEANUP_INTERVAL_MS = 60 * 60 * 1000

    while (this.isRunning) {
      try {
        if (Date.now() - this.lastCleanupAt >= CLEANUP_INTERVAL_MS) {
          try {
            const deleted = await cleanupOldLogs()
            this.lastCleanupAt = Date.now()
            if (deleted > 0) {
              logger.info({ deleted }, `Cleanup: удалено ${deleted} старых логов`)
            }
          } catch (err) {
            logger.error({ err }, 'Cleanup failed')
          }
        }

        const cycleStart = Date.now()

        await this.matcher.ensureFresh()
        this.refreshGroups()

        const groups = this.matcher.getUniqueGroups()

        if (groups.length === 0) {
          logger.info('Нет групп для краулинга, ожидание...')
          await delay(10_000)
          continue
        }

        logger.info(
          `Цикл: ${groups.length} групп, интервал ${config.monitor.crawlIntervalMs}ms`,
        )

        for (const group of groups) {
          if (!this.isRunning) break

          const groupKey = this.buildGroupKey(group)

          await this.crawlQueue.add(groupKey, {
            brandSlug: group.brandSlug,
            modelSlug: group.modelSlug,
            city: group.city,
            priceMin: group.priceMin,
            priceMax: group.priceMax,
            yearMin: group.yearMin,
            yearMax: group.yearMax,
            mileageMax: group.mileageMax,
            searchRadius: group.searchRadius,
            groupKey,
          })

          await this.waitForJob(groupKey)
        }

        const elapsed = Date.now() - cycleStart
        const remaining = config.monitor.crawlIntervalMs - elapsed

        logger.info(
          `Цикл завершён: ${groups.length} групп за ${Math.round(elapsed / 1000)}s, пауза ${Math.max(0, Math.round(remaining / 1000))}s`,
        )
        writeMonitorLog({
          type: 'SYSTEM',
          level: 'INFO',
          message: `Цикл завершён: ${groups.length} групп за ${Math.round(elapsed / 1000)}s`,
          meta: { groups: groups.length, elapsedMs: elapsed, remainingMs: Math.max(0, remaining) },
        })

        if (remaining > 0 && this.isRunning) {
          await delay(remaining)
        }
      } catch (err) {
        logger.error({ err }, 'Ошибка в цикле краулинга, повтор через 10s...')
        writeMonitorLog({
          type: 'SYSTEM',
          level: 'ERROR',
          message: `Ошибка в цикле краулинга: ${err instanceof Error ? err.message : String(err)}`,
          meta: { error: err instanceof Error ? err.message : String(err) },
        })
        await delay(10_000)
      }
    }
  }

  private async waitForJob(groupKey: string): Promise<void> {
    const maxWait = 120_000
    const pollInterval = 500
    const start = Date.now()

    while (this.isRunning && Date.now() - start < maxWait) {
      const waiting = await this.crawlQueue.getWaitingCount()
      const active = await this.crawlQueue.getActiveCount()

      if (waiting === 0 && active === 0) return

      await delay(pollInterval)
    }

    if (Date.now() - start >= maxWait) {
      logger.warn({ groupKey }, 'Timed out waiting for job to complete')
    }
  }

  private async subscribeToPubSub(): Promise<void> {
    await redisSub.subscribe(MONITOR_SUBSCRIPTIONS_CHANNEL)

    redisSub.on('message', async (channel, message) => {
      if (channel !== MONITOR_SUBSCRIPTIONS_CHANNEL) return
      if (!this.isRunning) return

      logger.info({ message }, 'Subscriptions changed event')

      try {
        await this.matcher.loadSubscriptions()
        this.refreshGroups()
      } catch (err) {
        logger.error({ err }, 'Failed to sync after subscription change')
      }
    })
  }

  private buildGroupKey(group: CrawlGroup): string {
    return `${group.brandSlug}:${group.modelSlug}:${group.city || 'all'}`
  }

  getMatcher(): SubscriptionMatcher {
    return this.matcher
  }

  getActiveGroupCount(): number {
    return this.activeGroupKeys.size
  }

  isActive(): boolean {
    return this.isRunning
  }
}
