import { type ListingCard } from '../crawler/listing-parser.js'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price)
}

export function buildListingMessage(card: ListingCard, label: string): string {
  const lines = [
    `🚗 ${escapeHtml(card.title)}`,
    `💰 ${formatPrice(card.price)} ₽`,
  ]
  if (card.city) lines.push(`📍 ${escapeHtml(card.city)}`)
  if (card.sellerType) lines.push(escapeHtml(card.sellerType))
  if (card.mileage != null) lines.push(`🛣 ${formatPrice(card.mileage)} км`)
  lines.push('')
  lines.push(`🔔 ${escapeHtml(label)}`)

  return lines.join('\n')
}

export function buildFirstRunMessage(
  card: ListingCard,
  label: string,
): string {
  const msg = buildListingMessage(card, label)
  return (
    msg +
    '\n\n✅ Мониторинг запущен! Это последнее объявление на текущий момент.\nНовые объявления будут приходить автоматически.'
  )
}

export function buildBatchMessage(
  cards: ListingCard[],
  label: string,
): string {
  const lines = [`🔔 ${escapeHtml(label)} — ${cards.length} новых объявлений:\n`]

  for (const card of cards.slice(0, 10)) {
    const price = formatPrice(card.price)
    lines.push(`• ${escapeHtml(card.title)} — ${price} ₽`)
  }

  if (cards.length > 10) {
    lines.push(`\n...и ещё ${cards.length - 10}`)
  }

  return lines.join('\n')
}
