function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

export const config = {
  database: {
    url: requireEnv('DATABASE_URL'),
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  telegram: {
    botToken: requireEnv('BOT_TOKEN'),
    adminChatId: process.env.ADMIN_CHAT_ID || '',
  },
  proxy: {
    mobileProxyUrl: process.env.MOBILE_PROXY_URL || '',
    mobileProxyChangeUrl: process.env.MOBILE_PROXY_CHANGE_URL || '',
    spfaApiKey: process.env.SPFA_API_KEY || '',
  },
  admin: {
    port: parseInt(process.env.ADMIN_PORT || '3001', 10),
  },
  monitor: {
    crawlIntervalMs: parseInt(process.env.CRAWL_INTERVAL_MS || '300000', 10),
    dedupTtlSeconds: parseInt(process.env.DEDUP_TTL_SECONDS || '604800', 10),
    maxNotificationsPerCycle: parseInt(process.env.MAX_NOTIFICATIONS_PER_CYCLE || '20', 10),
  },
  logLevel: process.env.LOG_LEVEL || 'info',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const
