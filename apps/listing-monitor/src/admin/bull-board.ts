import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { ExpressAdapter } from '@bull-board/express'
import type { Express } from 'express'
import type { Queue } from 'bullmq'

export function setupBullBoard(app: Express, crawlQueue: Queue, notifyQueue: Queue) {
  const serverAdapter = new ExpressAdapter()
  serverAdapter.setBasePath('/queue')

  createBullBoard({
    queues: [
      new BullMQAdapter(crawlQueue),
      new BullMQAdapter(notifyQueue),
    ],
    serverAdapter,
  })

  app.use('/queue', serverAdapter.getRouter())
}
