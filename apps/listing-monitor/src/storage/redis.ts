import Redis from 'ioredis'
import { config } from '../config.js'

export const redis = new Redis(config.redis.url)
export const redisSub = new Redis(config.redis.url)

export function createBullConnection() {
  return new Redis(config.redis.url, { maxRetriesPerRequest: null })
}

export async function disconnectRedis() {
  await redis.quit()
  await redisSub.quit()
}
