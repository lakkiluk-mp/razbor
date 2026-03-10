import type Redis from 'ioredis'

const KEYS = {
  freeSlotsClosed: 'monitor:settings:freeSlotsClosed',
  freeSlotsBlocked: 'monitor:settings:freeSlotsBlocked',
} as const

export interface MonitorSettings {
  freeSlotsClosed: boolean
  freeSlotsBlocked: boolean
}

export async function getMonitorSettings(redis: Redis | null): Promise<MonitorSettings> {
  if (!redis) return { freeSlotsClosed: false, freeSlotsBlocked: false }
  const [closed, blocked] = await Promise.all([
    redis.get(KEYS.freeSlotsClosed),
    redis.get(KEYS.freeSlotsBlocked),
  ])
  return {
    freeSlotsClosed: closed === 'true',
    freeSlotsBlocked: blocked === 'true',
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
