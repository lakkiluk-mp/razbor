import Redis from 'ioredis'

let redis: Redis | null = null
let initialized = false

function initRedis(): void {
  if (initialized) return
  initialized = true

  const url = process.env.REDIS_URL
  if (!url) return

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) return null
        return Math.min(times * 200, 2000)
      },
    })

    redis.on('error', (err) => {
      console.error('[Cache] Redis error:', err.message)
    })

    redis.on('ready', () => {
      console.log('[Cache] Redis connected')
    })

    redis.on('close', () => {
      redis = null
      initialized = false
    })
  } catch {
    redis = null
  }
}

export function getRedis(): Redis | null {
  initRedis()
  return redis
}
