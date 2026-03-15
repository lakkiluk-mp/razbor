import { cn } from '@/lib/utils'
import { formatMoney } from '@/lib/format'
import { DAMAGED_TITLE_RE } from '@razbor/shared'

interface RegionListingItem {
  id: string
  title: string
  brand: string
  model: string
  price: number
  year: number | null
  city: string
  url: string
  mileage: number | null
  publishedAt: string
  sellerType: string
  isDamaged: boolean
  isActive: boolean
  generationId: string | null
  configGroups: string | null
  estimateAvg: number | null
  estimateExact: boolean
  profit: number | null
  profitPercent: number | null
}

interface RegionListingCardProps {
  listing: RegionListingItem
  onSelect?: () => void
}

function getBadgeClass(profitPercent: number, isDamaged: boolean): string {
  if (isDamaged) return 'bg-amber-500/15 text-amber-400'
  if (profitPercent >= 0) return 'bg-green-500/15 text-green-400'
  return 'bg-red-500/15 text-red-400'
}

function formatBadgeLabel(profitPercent: number, isDamaged: boolean): string {
  const prefix = isDamaged ? '≈' : ''
  const capped = Math.min(Math.abs(Math.round(profitPercent)), 999)
  const suffix = Math.abs(Math.round(profitPercent)) > 999 ? '+' : ''
  if (profitPercent >= 0) return `${prefix}+${capped}%${suffix}`
  return `${prefix}-${capped}%${suffix}`
}

function formatPublishedAt(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const now = new Date()

  const moscowOffset = 3 * 60
  const localOffset = now.getTimezoneOffset()
  const offsetDiff = (moscowOffset + localOffset) * 60 * 1000

  const moscowNow = new Date(now.getTime() + offsetDiff)
  const moscowDate = new Date(date.getTime() + offsetDiff)

  const todayStart = new Date(moscowNow)
  todayStart.setHours(0, 0, 0, 0)

  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  const time = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  })

  if (moscowDate >= todayStart) return time
  if (moscowDate >= yesterdayStart) return `вчера, ${time}`

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Moscow',
  })
}

function formatMileage(km: number): string {
  return km.toLocaleString('ru-RU') + ' км'
}

export function RegionListingCard({ listing, onSelect }: RegionListingCardProps) {
  const {
    title,
    price,
    city,
    url,
    mileage,
    publishedAt,
    isDamaged,
    estimateAvg,
    profit,
    profitPercent,
  } = listing

  const damaged = isDamaged || DAMAGED_TITLE_RE.test(title)
  const hasEstimate = estimateAvg !== null
  const showBadge = profitPercent !== null

  const handleCardClick = () => {
    if (onSelect) {
      onSelect()
      return
    }
    const tg = window.Telegram?.WebApp
    if (tg?.openLink) {
      tg.openLink(url)
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <div
      className={cn(
        'bg-zinc-900 rounded-xl px-3 py-2.5',
        damaged && 'border-l-2 border-amber-500',
      )}
    >
      <div
        className="cursor-pointer active:opacity-80"
        onClick={handleCardClick}
      >
        <div className="flex justify-between gap-2">
          <span className="text-[13px] font-medium text-zinc-100 leading-tight line-clamp-2 min-w-0">
            {title}
          </span>
          <span className="text-sm font-bold text-zinc-100 text-right whitespace-nowrap shrink-0">
            {formatMoney(price)}
          </span>
        </div>

        <div className="flex justify-between items-baseline gap-2 mt-0.5">
          <span className="text-sm text-zinc-400">
            Прибыль разбора:
          </span>
          {hasEstimate && profit !== null ? (
            <span
              className={cn(
                'text-base font-bold whitespace-nowrap',
                damaged
                  ? 'text-amber-400'
                  : profit >= 0
                    ? 'text-green-400'
                    : 'text-red-400',
              )}
            >
              {damaged ? '≈' : ''}
              {profit >= 0 ? '+' : ''}
              {formatMoney(profit)}
            </span>
          ) : (
            <span className="text-zinc-500 text-xs whitespace-nowrap">
              Оценка недоступна
            </span>
          )}
        </div>

        <div className="flex justify-between items-center gap-2 mt-0.5">
          <span className="text-xs text-zinc-500 truncate">
            {mileage !== null && <>{formatMileage(mileage)} · </>}
            {city}
            {publishedAt && <> · {formatPublishedAt(publishedAt)}</>}
            {damaged && (
              <span className="text-amber-500 font-medium"> · ⚠️ Битый</span>
            )}
          </span>
          {showBadge && profitPercent !== null && (
            <span
              className={cn(
                'text-[11px] font-bold px-1.5 py-0.5 rounded-md shrink-0',
                getBadgeClass(profitPercent, damaged),
              )}
            >
              {formatBadgeLabel(profitPercent, damaged)}
            </span>
          )}
        </div>
      </div>

    </div>
  )
}
