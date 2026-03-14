import { prisma } from './prisma.js'

export async function cleanupOldLogs(retentionDays: number = 2): Promise<number> {
  try {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
    const result = await prisma.monitorLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    })
    return result.count
  } catch (err) {
    console.error('[MonitorLog] Failed to cleanup old logs:', err)
    return 0
  }
}

export async function writeMonitorLog(params: {
  type: 'CRAWL' | 'NOTIFICATION' | 'PROXY' | 'STRATEGY' | 'SYSTEM'
  level?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  brandSlug?: string
  modelSlug?: string
  message: string
  meta?: Record<string, unknown>
}): Promise<void> {
  try {
    await prisma.monitorLog.create({
      data: {
        type: params.type,
        level: params.level ?? 'INFO',
        brandSlug: params.brandSlug,
        modelSlug: params.modelSlug,
        message: params.message,
        meta: params.meta ?? undefined,
      },
    })
  } catch (err) {
    console.error('[MonitorLog] Failed to write:', err)
  }
}
