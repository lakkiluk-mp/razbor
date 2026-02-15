import { createServer } from 'node:http'
import { prisma } from '@razbor/db'
import { yoga } from './graphql.js'
import { bot } from './bot/index.js'
import { registerPaymentHandlers } from './bot/payments.js'
import { startRenewalCron } from './cron/renewal.js'
import { createYooKassaWebhookHandler } from './payments/yookassa-webhook.js'

const PORT = Number(process.env.PORT) || 4000
const BOT_TOKEN = process.env.BOT_TOKEN ?? ''
const BOT_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL
const botPath = `/bot${BOT_TOKEN}`

const MAX_BODY_SIZE = 1024 * 1024

if (bot) {
  registerPaymentHandlers(bot)
}

const handleYooKassaWebhook = createYooKassaWebhookHandler(prisma)

function collectBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY_SIZE) {
        req.destroy()
        reject(new Error('Payload too large'))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString()))
    req.on('error', reject)
  })
}

const server = createServer(async (req, res) => {
  const url = req.url ?? '/'

  if (req.method === 'POST' && url === botPath && bot) {
    const body = await collectBody(req).catch(() => null)
    if (body === null) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Bad request' }))
      return
    }

    let update: unknown
    try {
      update = JSON.parse(body)
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON' }))
      return
    }

    try {
      await bot.handleUpdate(update as Parameters<typeof bot.handleUpdate>[0])
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
    } catch (err) {
      console.error('Bot webhook error:', err)
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Internal error' }))
    }
    return
  }

  if (url.startsWith('/api/graphql')) {
    yoga(req, res)
    return
  }

  if (req.method === 'POST' && url === '/api/yookassa/webhook') {
    const body = await collectBody(req).catch(() => null)
    if (body === null) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true }))
      return
    }
    await handleYooKassaWebhook(req, res, body)
    return
  }

  if (url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok' }))
    return
  }

  if (url.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`GraphQL: http://localhost:${PORT}/api/graphql`)
  console.log(`Health:  http://localhost:${PORT}/api/health`)

  startRenewalCron(prisma)

  if (bot && BOT_WEBHOOK_URL && BOT_TOKEN) {
    try {
      await bot.telegram.setWebhook(`${BOT_WEBHOOK_URL}${botPath}`)
      console.log(`Bot webhook: ${BOT_WEBHOOK_URL}${botPath}`)
    } catch (err) {
      console.error('Failed to set bot webhook:', err)
    }
  }
})

const shutdown = () => {
  server.close(() => {
    process.exit(0)
  })
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
