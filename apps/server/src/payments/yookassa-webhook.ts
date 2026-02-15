import type { IncomingMessage, ServerResponse } from 'node:http'
import type { PrismaClient } from '@razbor/db'
import { handlePaymentSucceeded, handlePaymentCanceled } from '@razbor/api'

const YOOKASSA_CIDRS = [
  { ip: 0xb9474c00, mask: 0xffffffe0 }, // 185.71.76.0/27
  { ip: 0xb9474d00, mask: 0xffffffe0 }, // 185.71.77.0/27
  { ip: 0x4d4b9900, mask: 0xffffff80 }, // 77.75.153.0/25
  { ip: 0x4d4b9a80, mask: 0xffffff80 }, // 77.75.154.128/25
]

const YOOKASSA_SINGLE_IPS = [
  0x4d4b9c0b, // 77.75.156.11
  0x4d4b9c23, // 77.75.156.35
]

function ipToNumber(ip: string): number {
  const cleaned = ip.includes(':') ? ip.split(':').pop()! : ip
  const trimmed = cleaned.replace('::ffff:', '')
  const parts = trimmed.split('.')
  if (parts.length !== 4) return 0
  return ((parseInt(parts[0]) << 24) | (parseInt(parts[1]) << 16) | (parseInt(parts[2]) << 8) | parseInt(parts[3])) >>> 0
}

function isYooKassaIP(ip: string): boolean {
  if (process.env.YOOKASSA_SKIP_IP_CHECK === 'true') return true

  if (ip.startsWith('2a02:5180:')) return true

  const num = ipToNumber(ip)
  if (num === 0) return false

  for (const single of YOOKASSA_SINGLE_IPS) {
    if (num === single) return true
  }

  for (const cidr of YOOKASSA_CIDRS) {
    if ((num & cidr.mask) === cidr.ip) return true
  }

  return false
}

function getClientIP(req: IncomingMessage): string {
  const realIp = req.headers['x-real-ip']
  if (realIp) {
    return (Array.isArray(realIp) ? realIp[0] : realIp).trim()
  }
  const forwarded = req.headers['x-forwarded-for']
  if (forwarded) {
    const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded
    const parts = raw.split(',')
    return parts[parts.length - 1].trim()
  }
  return req.socket.remoteAddress || ''
}

async function processWebhookAsync(data: Record<string, unknown>, prisma: PrismaClient) {
  const event = data.event as string
  const paymentObject = data.object as Record<string, unknown>

  console.log(`[YooKassa Webhook] Event: ${event}, PaymentID: ${paymentObject?.id}`)

  switch (event) {
    case 'payment.succeeded':
      await handlePaymentSucceeded(prisma, paymentObject)
      break
    case 'payment.canceled':
      await handlePaymentCanceled(prisma, paymentObject)
      break
    default:
      console.log(`[YooKassa Webhook] Unhandled event: ${event}`)
  }
}

export function createYooKassaWebhookHandler(prisma: PrismaClient) {
  return (req: IncomingMessage, res: ServerResponse, body: string) => {
    const clientIP = getClientIP(req)

    if (!isYooKassaIP(clientIP)) {
      console.warn(`[YooKassa Webhook] Blocked IP: ${clientIP}`)
      res.writeHead(403, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Forbidden' }))
      return
    }

    let data: Record<string, unknown>
    try {
      data = JSON.parse(body)
    } catch (err) {
      console.error('[YooKassa Webhook] Invalid JSON:', err)
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Invalid JSON' }))
      return
    }

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ ok: true }))

    processWebhookAsync(data, prisma).catch((err) => {
      console.error('[YooKassa Webhook] Async processing error:', err)
    })
  }
}
