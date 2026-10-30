import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.ts'],
    env: {
      DATABASE_URL: 'postgresql://razbor:razbor_dev@localhost:5433/razbor',
      BOT_TOKEN: 'test-bot-token',
      LOG_LEVEL: 'silent',
      NODE_ENV: 'production',
    },
  },
})
