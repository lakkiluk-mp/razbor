import { Queue } from 'bullmq'
import { createLogger } from './logger/index.js'
import { createBullConnection, disconnectRedis } from './storage/redis.js'
import { prisma } from './storage/prisma.js'
import { SubscriptionMatcher } from './matcher/subscription-matcher.js'
import { createCrawlerWorker } from './workers/crawler.worker.js'
import { createNotifierWorker } from './workers/notifier.worker.js'
import { createRegionCrawlerWorker, destroyRegionFetcher, type RegionCrawlJobData } from './workers/region-crawler.worker.js'
import { createAdminSearchWatchWorker, destroyAdminWatchFetcher, type AdminSearchWatchJobData } from './workers/admin-search-watch.worker.js'
import { MonitorScheduler } from './workers/scheduler.worker.js'
import { destroyFetcher } from './crawler/listings.js'
import { createAdminServer } from './admin/server.js'
import { type CrawlJobData } from './workers/crawler.worker.js'
import { type NotifyJobData } from './workers/crawler.worker.js'

const logger = createLogger('main')

async function main() {
  logger.info('Listing monitor starting...')

  const crawlQueue = new Queue<CrawlJobData>('crawl', {
    connection: createBullConnection(),
  })
  const notifyQueue = new Queue<NotifyJobData>('notify', {
    connection: createBullConnection(),
  })
  const regionCrawlQueue = new Queue<RegionCrawlJobData>('region-crawl', {
    connection: createBullConnection(),
  })
  const adminSearchWatchQueue = new Queue<AdminSearchWatchJobData>('admin-search-watch', {
    connection: createBullConnection(),
  })

  await regionCrawlQueue.drain()
  logger.info('Region crawl queue drained on startup')

  const matcher = new SubscriptionMatcher()

  const crawlerWorker = createCrawlerWorker(notifyQueue, matcher)
  const notifierWorker = createNotifierWorker()
  const regionCrawlerWorker = createRegionCrawlerWorker(prisma)
  const adminSearchWatchWorker = createAdminSearchWatchWorker()

  const scheduler = new MonitorScheduler(crawlQueue, regionCrawlQueue, adminSearchWatchQueue, matcher)
  await scheduler.start()

  const adminServer = createAdminServer(scheduler, crawlQueue, notifyQueue)

  logger.info(
    { groups: scheduler.getActiveGroupCount() },
    'Listing monitor started',
  )

  let isShuttingDown = false

  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      logger.warn({ signal }, 'Forced exit (second signal)')
      process.exit(1)
    }
    isShuttingDown = true
    logger.info({ signal }, 'Shutting down...')

    const forceTimer = setTimeout(() => {
      logger.warn('Force exit after timeout')
      process.exit(1)
    }, 10000)
    forceTimer.unref()

    try {
      adminServer.close()
      await scheduler.stop()
      await adminSearchWatchWorker.close()
      await adminSearchWatchQueue.close()
      await destroyAdminWatchFetcher()
      await regionCrawlerWorker.close()
      await regionCrawlQueue.close()
      await crawlerWorker.close()
      await notifierWorker.close()
      await crawlQueue.close()
      await notifyQueue.close()
      await destroyFetcher()
      destroyRegionFetcher()
      await disconnectRedis()
      await prisma.$disconnect()

      logger.info('Shutdown complete')
      process.exit(0)
    } catch (err) {
      logger.error({ err }, 'Error during shutdown')
      process.exit(1)
    }
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

main().catch((err) => {
  const errorLogger = createLogger('main')
  errorLogger.fatal(err, 'Fatal error')
  process.exit(1)
})
