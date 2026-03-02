import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { PrismaClient } from '@razbor/db'
import type { TelegramApi, TelegramPhoto, InputMediaPhoto } from '../schema/builder'

const DELAY_MS = 50
const MEDIA_GROUP_DELAY_MS = 150
const MAX_RETRIES = 3
const UPLOADS_DIR = join(process.cwd(), 'uploads')

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function extractRetryAfter(err: unknown): number {
  const msg = err instanceof Error ? err.message : String(err)
  const match = msg.match(/retry after (\d+)/i)
  return match ? parseInt(match[1], 10) : 5
}

function isRateLimited(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err)
  return msg.includes('429') || msg.toLowerCase().includes('too many requests')
}

function extractFileId(result: unknown): string | null {
  if (!result || typeof result !== 'object') return null
  const msg = result as Record<string, unknown>
  const photo = msg.photo
  if (Array.isArray(photo) && photo.length > 0) {
    const last = photo[photo.length - 1]
    if (last && typeof last === 'object' && 'file_id' in last) {
      return (last as { file_id: string }).file_id
    }
  }
  return null
}

function extractMediaGroupFileIds(result: unknown): string[] {
  if (!Array.isArray(result)) return []
  return result
    .map((msg) => extractFileId(msg))
    .filter((id): id is string => id !== null)
}

async function resolvePhoto(url: string): Promise<TelegramPhoto> {
  if (url.startsWith('http')) return url
  if (url.startsWith('/uploads/')) {
    const fileName = url.slice('/uploads/'.length)
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      throw new Error(`Invalid file path: ${fileName}`)
    }
    const filePath = join(UPLOADS_DIR, fileName)
    if (!filePath.startsWith(UPLOADS_DIR + '/')) {
      throw new Error(`Path traversal attempt: ${fileName}`)
    }
    const buffer = await readFile(filePath)
    return { source: buffer, filename: fileName }
  }
  return url
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (isRateLimited(err) && attempt < MAX_RETRIES) {
        const retryAfter = extractRetryAfter(err)
        await delay(retryAfter * 1000)
        continue
      }
      throw err
    }
  }
  throw new Error('Max retries exceeded')
}

async function sendToUser(
  telegram: TelegramApi,
  chatId: string,
  photos: TelegramPhoto[],
  message: string | null,
): Promise<unknown> {
  if (photos.length > 1) {
    const media: InputMediaPhoto[] = photos.map((photo, i) => ({
      type: 'photo' as const,
      media: photo,
      ...(i === 0 && message ? { caption: message, parse_mode: 'HTML' } : {}),
    }))
    return withRetry(() => telegram.sendMediaGroup(chatId, media))
  }

  if (photos.length === 1 && message) {
    return withRetry(() =>
      telegram.sendPhoto(chatId, photos[0], { caption: message, parse_mode: 'HTML' }),
    )
  }

  if (photos.length === 1) {
    return withRetry(() => telegram.sendPhoto(chatId, photos[0]))
  }

  if (message) {
    return withRetry(() =>
      telegram.sendMessage(chatId, message, { parse_mode: 'HTML' }),
    )
  }

  return null
}

export async function executeBroadcast(
  prisma: PrismaClient,
  telegram: TelegramApi,
  broadcastId: string,
): Promise<void> {
  const broadcast = await prisma.broadcast.findUnique({
    where: { id: broadcastId },
  })
  if (!broadcast || broadcast.status !== 'sending') return

  let photos: TelegramPhoto[] = []
  for (const url of broadcast.imageUrls) {
    photos.push(await resolvePhoto(url))
  }

  const users = await prisma.user.findMany({
    select: { telegramId: true },
  })

  let sentCount = 0
  let failedCount = 0
  let fileIdsExtracted = false

  for (const user of users) {
    const current = await prisma.broadcast.findUnique({
      where: { id: broadcastId },
      select: { status: true },
    })
    if (!current || current.status === 'cancelled') {
      await prisma.broadcast.update({
        where: { id: broadcastId },
        data: { sentCount, failedCount },
      })
      return
    }

    try {
      const chatId = user.telegramId.toString()
      const result = await sendToUser(telegram, chatId, photos, broadcast.message)

      if (!fileIdsExtracted && photos.length > 0 && typeof photos[0] !== 'string') {
        if (photos.length > 1) {
          const fileIds = extractMediaGroupFileIds(result)
          if (fileIds.length === photos.length) {
            photos = fileIds
            fileIdsExtracted = true
          }
        } else {
          const fileId = extractFileId(result)
          if (fileId) {
            photos = [fileId]
            fileIdsExtracted = true
          }
        }
      }

      sentCount++
    } catch (err) {
      failedCount++
      const tgId = user.telegramId.toString()
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[Broadcast] Failed to send to ${tgId}: ${msg}`)
    }

    const processed = sentCount + failedCount
    if (processed > 0 && processed % 25 === 0) {
      await prisma.broadcast.update({
        where: { id: broadcastId },
        data: { sentCount, failedCount },
      })
    }

    await delay(photos.length > 1 ? MEDIA_GROUP_DELAY_MS : DELAY_MS)
  }

  await prisma.broadcast.update({
    where: { id: broadcastId },
    data: {
      sentCount,
      failedCount,
      status: failedCount === users.length && users.length > 0 ? 'failed' : 'completed',
    },
  })
}
