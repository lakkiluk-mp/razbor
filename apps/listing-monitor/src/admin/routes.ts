import { Router } from 'express'
import { prisma } from '../storage/prisma.js'
import type { MonitorScheduler } from '../workers/scheduler.worker.js'

export function createAdminRoutes(scheduler: MonitorScheduler): Router {
  const router = Router()

  router.get('/status', (_req, res) => {
    res.json({
      running: scheduler.isActive(),
      activeGroups: scheduler.getActiveGroupCount(),
      uptime: process.uptime(),
    })
  })

  router.get('/stats', async (req, res) => {
    try {
      const period = (req.query.period as string) || '1h'
      const hours = period === '24h' ? 24 : period === '6h' ? 6 : 1
      const since = new Date(Date.now() - hours * 60 * 60 * 1000)

      const [crawls, notifications, errors] = await Promise.all([
        prisma.monitorLog.count({ where: { type: 'CRAWL', createdAt: { gte: since } } }),
        prisma.monitorLog.count({ where: { type: 'NOTIFICATION', createdAt: { gte: since } } }),
        prisma.monitorLog.count({ where: { level: 'ERROR', createdAt: { gte: since } } }),
      ])

      res.json({ period, crawls, notifications, errors })
    } catch {
      res.status(500).json({ error: 'Failed to fetch stats' })
    }
  })

  router.get('/logs', async (req, res) => {
    try {
      const level = req.query.level as string
      const rawLimit = parseInt((req.query.limit as string) || '50', 10)
      const limit = Number.isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 200)

      const where: Record<string, unknown> = {}
      if (level) where.level = level.toUpperCase()

      const logs = await prisma.monitorLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      res.json(logs)
    } catch {
      res.status(500).json({ error: 'Failed to fetch logs' })
    }
  })

  router.post('/pause', async (_req, res) => {
    try {
      await scheduler.stop()
      res.json({ status: 'paused' })
    } catch {
      res.status(500).json({ error: 'Failed to pause scheduler' })
    }
  })

  router.post('/resume', async (_req, res) => {
    try {
      await scheduler.start()
      res.json({ status: 'resumed' })
    } catch {
      res.status(500).json({ error: 'Failed to resume scheduler' })
    }
  })

  return router
}
