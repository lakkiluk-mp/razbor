import express from 'express'
import { config } from '../config.js'
import { createLogger } from '../logger/index.js'
import { createAdminRoutes } from './routes.js'
import { setupBullBoard } from './bull-board.js'
import type { MonitorScheduler } from '../workers/scheduler.worker.js'
import type { Queue } from 'bullmq'

const logger = createLogger('admin')

export function createAdminServer(scheduler: MonitorScheduler, crawlQueue: Queue, notifyQueue: Queue) {
  const app = express()

  app.use('/api', createAdminRoutes(scheduler))
  setupBullBoard(app, crawlQueue, notifyQueue)

  const server = app.listen(config.admin.port, () => {
    logger.info({ port: config.admin.port }, 'Admin server started')
  })

  server.on('error', (err) => {
    logger.error({ err }, 'Admin server failed to start')
  })

  return server
}
