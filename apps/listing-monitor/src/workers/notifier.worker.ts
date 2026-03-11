import { type Job, Worker } from 'bullmq'
import { sendListing, sendAdminAlert } from '../notifier/telegram.js'
import { prisma } from '../storage/prisma.js'
import { createLogger } from '../logger/index.js'
import { createBullConnection, redis } from '../storage/redis.js'
import { type NotifyJobData } from './crawler.worker.js'
import { writeMonitorLog } from '../storage/monitor-log.js'
import { MONITOR_SUBSCRIPTIONS_CHANNEL } from '@razbor/shared'

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
      let blocked = false
      for (const card of limitedCards) {
        const result = await sendListing(telegramId, card, subscriptionLabel)
        if (result.blocked) {
          blocked = true
          break
        }
        if (result.sent) sentCount++
      }

      if (blocked) {
        const userSubs = await prisma.monitorSubscription.findMany({
          where: { user: { telegramId: BigInt(telegramId) }, isActive: true },
          select: { id: true },
        })
        const ids = userSubs.map((s) => s.id)

        if (ids.length > 0) {
          await prisma.monitorSubscription.updateMany({
            where: { id: { in: ids } },
            data: { isActive: false },
          })
          for (const id of ids) {
            try {
              await redis.publish(
                MONITOR_SUBSCRIPTIONS_CHANNEL,
                JSON.stringify({ action: 'deactivated', subscriptionId: id }),
              )
            } catch (err) {
              logger.error({ err }, 'Failed to publish deactivated event')
            }
          }
        }

        await sendAdminAlert(`Бот заблокирован пользователем ${telegramId}, деактивировано ${ids.length} подписок`)
        writeMonitorLog({
          type: 'NOTIFICATION',
          level: 'WARN',
          message: `Bot blocked by user ${telegramId}, deactivated ${ids.length} subscriptions`,
          meta: { telegramId, subscriptionIds: ids, subscriptionLabel },
        })
        return { sent: false, count: 0, blocked: true }
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
