import { createServer } from 'node:http'
import { createGzip } from 'node:zlib'
import { createReadStream, existsSync, mkdirSync, createWriteStream } from 'node:fs'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { stat } from 'node:fs/promises'
import cluster from 'node:cluster'
import Busboy from 'busboy'
import { prisma } from '@razbor/db'
import { yoga } from './graphql.js'
import { bot } from './bot/index.js'
import { startRenewalCron } from './cron/renewal.js'
import { createYooKassaWebhookHandler } from './payments/yookassa-webhook.js'
import { authenticateUser } from './auth.js'

const UPLOADS_DIR = join(process.cwd(), 'uploads')
if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true })

const ADMIN_TELEGRAM_IDS = (process.env.ADMIN_TELEGRAM_IDS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

const ALLOWED_EXT = new Set(Object.keys(MIME_TYPES))

const isProduction = process.env.NODE_ENV === 'production'

const isMainWorker = !cluster.isWorker || cluster.worker?.id === 1

const PORT = Number(process.env.PORT) || 4000
const BOT_TOKEN = process.env.BOT_TOKEN ?? ''
const BOT_WEBHOOK_URL = process.env.BOT_WEBHOOK_URL
const botPath = `/bot${BOT_TOKEN}`

const MAX_BODY_SIZE = 1024 * 1024

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
    } catch (err) {
      console.error('Bot webhook error:', err)
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))
    return
  }

  if (url.startsWith('/api/graphql')) {
    const acceptEncoding = req.headers['accept-encoding'] ?? ''
    const supportsGzip = typeof acceptEncoding === 'string' && acceptEncoding.includes('gzip')

    if (supportsGzip) {
      const response = await yoga.handleNodeRequest(req)
      const body = Buffer.from(await response.arrayBuffer())

      const gzipStream = createGzip()
      const chunks: Buffer[] = []

      gzipStream.on('data', (chunk: Buffer) => chunks.push(chunk))
      gzipStream.on('end', () => {
        const compressed = Buffer.concat(chunks)
        res.writeHead(response.status, {
          'Content-Type': response.headers.get('content-type') ?? 'application/json',
          'Content-Encoding': 'gzip',
          'Content-Length': compressed.length,
        })
        res.end(compressed)
      })

      gzipStream.end(body)
    } else {
      yoga(req, res)
    }
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

  if (req.method === 'POST' && url === '/api/admin/upload') {
    const initData = req.headers['x-telegram-init-data'] as string | undefined
    let isAuthorized = false

    if (initData) {
      const user = await authenticateUser(initData, prisma)
      isAuthorized = !!user && ADMIN_TELEGRAM_IDS.includes(user.telegramId.toString())
    } else if (!isProduction) {
      isAuthorized = ADMIN_TELEGRAM_IDS.includes('999999999')
    }

    if (!isAuthorized) {
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Forbidden' }))
      return
    }

    try {
      const busboy = Busboy({ headers: req.headers, limits: { fileSize: 5 * 1024 * 1024, files: 1 } })
      let filePath = ''
      let fileName = ''
      let rejected = false

      busboy.on('file', (_fieldname, file, info) => {
        const ext = extname(info.filename).toLowerCase()
        if (!ALLOWED_EXT.has(ext)) {
          rejected = true
          file.resume()
          return
        }
        fileName = `${randomUUID()}${ext}`
        filePath = join(UPLOADS_DIR, fileName)
        file.pipe(createWriteStream(filePath))
      })

      busboy.on('finish', () => {
        if (rejected || !fileName) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid file type' }))
          return
        }
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ url: `/uploads/${fileName}` }))
      })

      busboy.on('error', () => {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Upload failed' }))
      })

      req.pipe(busboy)
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Upload failed' }))
    }
    return
  }

  if (req.method === 'GET' && url.startsWith('/uploads/')) {
    const fileName = decodeURIComponent(url.slice('/uploads/'.length).split('?')[0])
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Bad request' }))
      return
    }

    const filePath = join(UPLOADS_DIR, fileName)
    if (!filePath.startsWith(UPLOADS_DIR + '/')) {
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Bad request' }))
      return
    }

    try {
      const fileStat = await stat(filePath)
      const ext = extname(fileName).toLowerCase()
      const contentType = MIME_TYPES[ext] ?? 'application/octet-stream'
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': fileStat.size,
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
      })
      createReadStream(filePath).pipe(res)
    } catch {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not found' }))
    }
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

  if (isMainWorker) {
    startRenewalCron(prisma)

    if (bot && BOT_WEBHOOK_URL && BOT_TOKEN) {
      try {
        await bot.telegram.setWebhook(`${BOT_WEBHOOK_URL}${botPath}`)
        console.log(`Bot webhook: ${BOT_WEBHOOK_URL}${botPath}`)
      } catch (err) {
        console.error('Failed to set bot webhook:', err)
      }
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
