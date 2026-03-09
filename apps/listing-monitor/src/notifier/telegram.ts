import { config } from '../config.js'
import { type ListingCard } from '../crawler/listing-parser.js'
import {
  buildListingMessage,
  buildFirstRunMessage,
  buildBatchMessage,
} from './message-builder.js'
import { createLogger } from '../logger/index.js'

const logger = createLogger('notifier')
const API_BASE = `https://api.telegram.org/bot${config.telegram.botToken}`

const rateLimiter = {
  lastGlobal: 0,
  perChat: new Map<string, number>(),
  globalInterval: 34,
  chatInterval: 1000,
}

function cleanupPerChat(): void {
  const now = Date.now()
  for (const [chatId, lastSent] of rateLimiter.perChat) {
    if (now - lastSent > 5000) {
      rateLimiter.perChat.delete(chatId)
    }
  }
}

async function waitForRateLimit(chatId: string): Promise<void> {
  if (rateLimiter.perChat.size > 1000) cleanupPerChat()

  const globalWait = rateLimiter.globalInterval - (Date.now() - rateLimiter.lastGlobal)
  if (globalWait > 0) await new Promise((r) => setTimeout(r, globalWait))
  rateLimiter.lastGlobal = Date.now()

  const lastChat = rateLimiter.perChat.get(chatId) || 0
  const chatWait = rateLimiter.chatInterval - (Date.now() - lastChat)
  if (chatWait > 0) await new Promise((r) => setTimeout(r, chatWait))
  rateLimiter.perChat.set(chatId, Date.now())
}

async function sendTelegram(
  method: string,
  body: Record<string, unknown>,
): Promise<boolean> {
  const url = `${API_BASE}/${method}`
  const maxRetries = 3

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        await res.text()
        return true
      }

      if (res.status === 429) {
        const data = (await res.json()) as {
          parameters?: { retry_after?: number }
        }
        const retryAfter = data?.parameters?.retry_after ?? 5
        logger.warn(
          { method, retryAfter, attempt },
          'Rate limited by Telegram, waiting',
        )
        await new Promise((r) => setTimeout(r, retryAfter * 1000))
        continue
      }

      const errorText = await res.text()
      logger.error(
        { method, status: res.status, error: errorText },
        'Telegram API error',
      )
      return false
    } catch (err) {
      logger.error({ method, attempt, err }, 'Telegram request failed')
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  return false
}

export async function sendListing(
  telegramId: string,
  card: ListingCard,
  label: string,
  isFirstRun = false,
): Promise<boolean> {
  await waitForRateLimit(telegramId)

  const text = isFirstRun
    ? buildFirstRunMessage(card, label)
    : buildListingMessage(card, label)

  const inlineKeyboard = {
    inline_keyboard: [[{ text: 'Открыть на Avito', url: card.url }]],
  }

  if (card.imageUrl) {
    return sendTelegram('sendPhoto', {
      chat_id: telegramId,
      photo: card.imageUrl,
      caption: text,
      parse_mode: 'HTML',
      reply_markup: inlineKeyboard,
    })
  }

  return sendTelegram('sendMessage', {
    chat_id: telegramId,
    text,
    parse_mode: 'HTML',
    reply_markup: inlineKeyboard,
  })
}

export async function sendBatch(
  telegramId: string,
  cards: ListingCard[],
  label: string,
): Promise<boolean> {
  await waitForRateLimit(telegramId)
  const text = buildBatchMessage(cards, label)
  return sendTelegram('sendMessage', {
    chat_id: telegramId,
    text,
    parse_mode: 'HTML',
  })
}

export async function sendAdminAlert(message: string): Promise<boolean> {
  if (!config.telegram.adminChatId) return false
  return sendTelegram('sendMessage', {
    chat_id: config.telegram.adminChatId,
    text: `⚠️ Listing Monitor Alert:\n${message}`,
  })
}
