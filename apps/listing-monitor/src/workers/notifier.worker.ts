import { type Job, Worker } from 'bullmq'
import { sendListing } from '../notifier/telegram.js'
import { prisma } from '../storage/prisma.js'
import { createLogger } from '../logger/index.js'
import { config } from '../config.js'
import { createBullConnection } from '../storage/redis.js'
import { type NotifyJobData } from './crawler.worker.js'
import { writeMonitorLog } from '../storage/monitor-log.js'

const logger = createLogger('notifier-worker')

export function createNotifierWorker(): Worker<NotifyJobData> {
  const worker = new Worker<NotifyJobData>(
    'notify',
    async (job: Job<NotifyJobData>) => {
      const { telegramId, cards, subscriptionId, subscriptionLabel } = job.data

      logger.info({ telegramId, cards: cards.length, subscriptionId }, 'Sending notification')

      const maxCards = 5
      const limitedCards = cards.slice(0, maxCards)

      let sentCount = 0
      for (const card of limitedCards) {
        const ok = await sendListing(telegramId, card, subscriptionLabel)
        if (ok) sentCount++
      }

      if (sentCount > 0) {
        await prisma.monitorSubscription.update({
          where: { id: subscriptionId },
          data: {
            notificationsSent: { increment: sentCount },
            lastNotifiedAt: new Date(),
          },
        })
      }

      logger.info({ telegramId, sentCount, total: cards.length, limited: limitedCards.length }, 'Notification processed')
      if (sentCount > 0) {
        writeMonitorLog({
          type: 'NOTIFICATION',
          level: 'INFO',
          message: `Sent ${sentCount} cards to ${telegramId}`,
          meta: { telegramId, sentCount, total: cards.length, subscriptionId, subscriptionLabel },
        })
      }
      return { sent: sentCount > 0, count: sentCount }
    },
    {
      connection: createBullConnection(),
      concurrency: 3,
    },
  )

  worker.on('failed', (job: Job<NotifyJobData> | undefined, err: Error) => {
    logger.error({ jobId: job?.id, telegramId: job?.data.telegramId, err: err.message }, 'Notify job failed')
    writeMonitorLog({
      type: 'NOTIFICATION',
      level: 'ERROR',
      message: `Notification failed: ${err.message}`,
      meta: { telegramId: job?.data.telegramId, subscriptionId: job?.data.subscriptionId, jobId: job?.id },
    })
  })

  return worker
}
