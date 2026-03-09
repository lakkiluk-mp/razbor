import { type Job, Worker } from 'bullmq'
import { sendListing } from '../notifier/telegram.js'
import { prisma } from '../storage/prisma.js'
import { createLogger } from '../logger/index.js'
import { config } from '../config.js'
import { createBullConnection } from '../storage/redis.js'
import { type NotifyJobData } from './crawler.worker.js'

const logger = createLogger('notifier-worker')

export function createNotifierWorker(): Worker<NotifyJobData> {
  const worker = new Worker<NotifyJobData>(
    'notify',
    async (job: Job<NotifyJobData>) => {
      const { telegramId, cards, subscriptionId, subscriptionLabel, isFirstRun } = job.data

      logger.info({ telegramId, cards: cards.length, subscriptionId, isFirstRun }, 'Sending notification')

      const maxCards = 5
      const limitedCards = cards.slice(0, maxCards)

      let sentCount = 0
      for (const card of limitedCards) {
        const ok = await sendListing(telegramId, card, subscriptionLabel, isFirstRun)
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
      return { sent: sentCount > 0, count: sentCount }
    },
    {
      connection: createBullConnection(),
      concurrency: 3,
    },
  )

  worker.on('failed', (job: Job<NotifyJobData> | undefined, err: Error) => {
    logger.error({ jobId: job?.id, telegramId: job?.data.telegramId, err: err.message }, 'Notify job failed')
  })

  return worker
}
