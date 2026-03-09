import pino from 'pino'
import { config } from '../config.js'

export function createLogger(module: string) {
  return pino({
    name: module,
    level: config.logLevel,
    transport:
      config.nodeEnv !== 'production'
        ? { target: 'pino-pretty' }
        : undefined,
  })
}
