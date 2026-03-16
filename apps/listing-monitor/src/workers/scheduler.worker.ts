import { Queue } from 'bullmq'
import { MONITOR_SUBSCRIPTIONS_CHANNEL, MONITOR_REGIONS } from '@razbor/shared'
import { SubscriptionMatcher, type CrawlGroup } from '../matcher/subscription-matcher.js'
import { redis, redisSub } from '../storage/redis.js'
import { createLogger } from '../logger/index.js'
import { config } from '../config.js'
import { type CrawlJobData } from './crawler.worker.js'
import { type RegionCrawlJobData, type RegionCrawlResult } from './region-crawler.worker.js'
import { writeMonitorLog, cleanupOldLogs } from '../storage/monitor-log.js'
import { RegionPrioritizer } from './region-prioritizer.js'

const logger = createLogger('scheduler')

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MonitorScheduler {
  private crawlQueue: Queue<CrawlJobData>
  private regionCrawlQueue: Queue<RegionCrawlJobData>
  private matcher: SubscriptionMatcher
  private activeGroupKeys = new Set<string>()
  private lastCleanupAt: number = 0
  private isRunning = false
  private cyclePromise: Promise<void> | null = null
  private regionCyclePromise: Promise<void> | null = null
  private deepCrawlRequested = false
  private lastDeepCrawlDate = ''
  private regionPrioritizer: RegionPrioritizer

  constructor(
    crawlQueue: Queue<CrawlJobData>,
    regionCrawlQueue: Queue<RegionCrawlJobData>,
    matcher: SubscriptionMatcher,
  ) {
    this.crawlQueue = crawlQueue
    this.regionCrawlQueue = regionCrawlQueue
    this.matcher = matcher
    this.regionPrioritizer = new RegionPrioritizer(config.regionCrawl.quickCrawlIntervalMs)
  }

  async start(): Promise<void> {
    logger.info('Starting scheduler...')

    await this.cleanupRepeatableJobs()
    await this.matcher.loadSubscriptions()
    this.refreshGroups()
    await this.subscribeToPubSub()

    this.isRunning = true
    this.cyclePromise = this.runContinuousLoop()

    if (config.regionCrawl.enabled) {
      this.regionCyclePromise = this.runRegionCrawlLoop()
    }

    logger.info({ groups: this.activeGroupKeys.size }, 'Scheduler started')
    writeMonitorLog({
      type: 'SYSTEM',
      level: 'INFO',
      message: `Scheduler started: ${this.activeGroupKeys.size} groups, region crawl: ${config.regionCrawl.enabled ? 'ON' : 'OFF'}`,
      meta: { groups: this.activeGroupKeys.size, regionCrawl: config.regionCrawl.enabled },
    })
  }

  async stop(): Promise<void> {
    this.isRunning = false
    await redisSub.unsubscribe(MONITOR_SUBSCRIPTIONS_CHANNEL)

    if (this.cyclePromise) {
      await this.cyclePromise.catch(() => {})
    }

    if (this.regionCyclePromise) {
      await this.regionCyclePromise.catch(() => {})
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

    const regionRepeatableJobs = await this.regionCrawlQueue.getRepeatableJobs()
    for (const job of regionRepeatableJobs) {
      await this.regionCrawlQueue.removeRepeatableByKey(job.key)
    }
    if (regionRepeatableJobs.length > 0) {
      logger.info({ count: regionRepeatableJobs.length }, 'Cleaned up old region repeatable jobs')
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

  private checkDeepCrawlCron(): boolean {
    const now = new Date()
    const todayKey = now.toISOString().slice(0, 10)

    const cronParts = config.regionCrawl.deepCrawlCron.split(' ')
    const cronMinute = parseInt(cronParts[0] ?? '0', 10)
    const cronHourPart = cronParts[1] ?? '0'

    let cronHours: number[]
    if (cronHourPart.startsWith('*/')) {
      const interval = parseInt(cronHourPart.slice(2), 10)
      cronHours = Array.from({ length: Math.floor(24 / interval) }, (_, i) => i * interval)
    } else {
      cronHours = [parseInt(cronHourPart, 10)]
    }

    const currentHour = now.getUTCHours()
    const currentMinute = now.getUTCMinutes()

    for (const h of cronHours) {
      const key = `${todayKey}-${h}`
      if (currentHour === h && currentMinute >= cronMinute && currentMinute < cronMinute + 10) {
        if (this.lastDeepCrawlDate !== key) {
          this.lastDeepCrawlDate = key
          return true
        }
      }
    }

    return false
  }

  private async isRegionCrawlPaused(): Promise<boolean> {
    try {
      const val = await redis.get('monitor:settings:regionCrawlPaused')
      return val === 'true'
    } catch {
      return false
    }
  }

  private async runRegionCrawlLoop(): Promise<void> {
    while (this.isRunning) {
      if (!config.regionCrawl.enabled) {
        await delay(60_000)
        continue
      }

      if (await this.isRegionCrawlPaused()) {
        await delay(30_000)
        continue
      }

      if (this.checkDeepCrawlCron()) {
        this.deepCrawlRequested = true
      }

      if (this.deepCrawlRequested) {
        this.deepCrawlRequested = false
        await this.runInterleavedDeepCrawl()
      }

      const cycleStart = Date.now()
      const orderedSlugs = this.regionPrioritizer.getOrderedRegions()

      for (const slug of orderedSlugs) {
        if (!this.isRunning) break
        if (await this.isRegionCrawlPaused()) break

        if (this.checkDeepCrawlCron()) {
          this.deepCrawlRequested = true
          break
        }

        const job = await this.regionCrawlQueue.add(`region:${slug}`, {
          regionSlug: slug,
          mode: 'quick' as const,
        })

        const result = await this.waitForRegionJob(job.id!)
        this.applyRegionResult(slug, result)
      }

      const elapsed = Date.now() - cycleStart
      const remaining = config.regionCrawl.quickCrawlIntervalMs - elapsed

      if (remaining > 0 && this.isRunning) {
        await delay(remaining)
      }
    }
  }

  private async runInterleavedDeepCrawl(): Promise<void> {
    const deepOrder = this.regionPrioritizer.getOrderedRegions()

    logger.info(`Deep crawl started: ${deepOrder.length} regions, interleaved`)
    writeMonitorLog({
      type: 'CRAWL',
      level: 'INFO',
      message: `Deep crawl начат: ${deepOrder.length} регионов с интерливингом`,
      meta: { regions: deepOrder.length, pages: config.regionCrawl.deepCrawlPages },
    })

    const cycleStart = Date.now()

    for (let i = 0; i < deepOrder.length; i++) {
      if (!this.isRunning) break
      if (await this.isRegionCrawlPaused()) {
        logger.info('Deep crawl paused by admin')
        break
      }

      const slug = deepOrder[i]

      const deepJob = await this.regionCrawlQueue.add(`region-deep:${slug}`, {
        regionSlug: slug,
        mode: 'deep' as const,
      })
      const deepResult = await this.waitForRegionJob(deepJob.id!)
      this.applyRegionResult(slug, deepResult)

      logger.info({ regionSlug: slug, progress: `${i + 1}/${deepOrder.length}` }, 'Deep crawl region done, running quick refresh')

      const quickOrder = this.regionPrioritizer.getOrderedRegions()
      for (const qSlug of quickOrder) {
        if (!this.isRunning) break
        const quickJob = await this.regionCrawlQueue.add(`region-quick:${qSlug}`, {
          regionSlug: qSlug,
          mode: 'quick' as const,
        })
        const quickResult = await this.waitForRegionJob(quickJob.id!)
        this.applyRegionResult(qSlug, quickResult)
      }
    }

    const elapsedMin = Math.round((Date.now() - cycleStart) / 60000)
    logger.info({ elapsedMin }, 'Deep crawl cycle complete')
    writeMonitorLog({
      type: 'CRAWL',
      level: 'INFO',
      message: `Deep crawl завершён за ${elapsedMin} мин`,
      meta: { regions: deepOrder.length, elapsedMin },
    })
  }

  private async waitForRegionJob(jobId: string): Promise<RegionCrawlResult | null> {
    const maxWait = 900_000
    const pollInterval = 2000
    const start = Date.now()

    while (this.isRunning && Date.now() - start < maxWait) {
      const job = await this.regionCrawlQueue.getJob(jobId)
      if (!job) return null

      const state = await job.getState()
      if (state === 'completed') {
        try {
          const raw = job.returnvalue
          if (!raw) return null
          const rv: RegionCrawlResult = typeof raw === 'string' ? JSON.parse(raw) : raw
          return rv
        } catch {
          return null
        }
      }
      if (state === 'failed') return null

      await delay(pollInterval)
    }

    if (Date.now() - start >= maxWait) {
      logger.warn({ jobId }, 'Timed out waiting for region job')
    }
    return null
  }

  private applyRegionResult(slug: string, result: RegionCrawlResult | null): void {
    if (result && result.totalCards > 0) {
      this.regionPrioritizer.recordSuccess(slug, result.newCards)
    } else {
      this.regionPrioritizer.recordFailure(slug)
    }
  }

  private async waitForJob(groupKey: string): Promise<void> {
    const maxWait = 120_000
    const pollInterval = 1000
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
