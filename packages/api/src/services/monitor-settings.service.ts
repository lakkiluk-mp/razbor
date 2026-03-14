import type Redis from 'ioredis'

const KEYS = {
  freeSlotsClosed: 'monitor:settings:freeSlotsClosed',
  freeSlotsBlocked: 'monitor:settings:freeSlotsBlocked',
  regionCrawlPaused: 'monitor:settings:regionCrawlPaused',
} as const

export interface MonitorSettings {
  freeSlotsClosed: boolean
  freeSlotsBlocked: boolean
  regionCrawlPaused: boolean
}

export async function getMonitorSettings(redis: Redis | null): Promise<MonitorSettings> {
  if (!redis) return { freeSlotsClosed: false, freeSlotsBlocked: false, regionCrawlPaused: false }
  const [closed, blocked, regionPaused] = await Promise.all([
    redis.get(KEYS.freeSlotsClosed),
    redis.get(KEYS.freeSlotsBlocked),
    redis.get(KEYS.regionCrawlPaused),
  ])
  return {
    freeSlotsClosed: closed === 'true',
    freeSlotsBlocked: blocked === 'true',
    regionCrawlPaused: regionPaused === 'true',
  }
}

export async function setFreeSlotsClosed(redis: Redis | null, value: boolean): Promise<void> {
  if (!redis) return
  await redis.set(KEYS.freeSlotsClosed, String(value))
}

export async function setFreeSlotsBlocked(redis: Redis | null, value: boolean): Promise<void> {
  if (!redis) return
  await redis.set(KEYS.freeSlotsBlocked, String(value))
}

export async function setRegionCrawlPaused(redis: Redis | null, value: boolean): Promise<void> {
  if (!redis) return
  await redis.set(KEYS.regionCrawlPaused, String(value))
}
