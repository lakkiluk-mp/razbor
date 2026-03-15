import { useNavigate } from 'react-router-dom'
import { ExternalLink, Share2, Calculator, AlertTriangle, MapPin, Calendar, Gauge, Car, Settings, User } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { formatMoney } from '@/lib/format'
import { cn } from '@/lib/utils'
import { DAMAGED_TITLE_RE } from '@razbor/shared'

interface ListingItem {
  id: string
  title: string
  brand: string
  model: string
  engineVolume: string
  transmission: string
  price: number
  year: number | null
  url: string
  city: string
  imageUrl: string
  publishedAt: string
  sellerType: string
  mileage: number | null
  isDamaged: boolean
  isActive: boolean
  generationId: string | null
  configGroups: string | null
  estimateMin: number | null
  estimateMax: number | null
  estimateAvg: number | null
  estimateExact: boolean
  profit: number | null
  profitPercent: number | null
  regionSlug: string
}

interface ListingDetailDrawerProps {
  listing: ListingItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatPublishedAt(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  })
}

function formatMileage(km: number): string {
  return km.toLocaleString('ru-RU') + ' км'
}

function formatTransmission(t: string): string {
  switch (t) {
    case 'AT': return 'АКПП'
    case 'MT': return 'МКПП'
    case 'CVT': return 'Вариатор'
    case 'AMT': return 'Робот'
    default: return t
  }
}

function formatSellerType(s: string): string {
  switch (s) {
    case 'private': return 'Частное'
    case 'dealer': return 'Дилер'
    case 'company': return 'Компания'
    default: return s
  }
}

function buildEstimationPath(generationId: string, configGroups: string | null): string {
  let path = `/estimation/${generationId}`
  if (!configGroups) return path

  const params = new URLSearchParams()
  const firstCombo = configGroups.split(',')[0]
  if (!firstCombo) return path
  const segments = firstCombo.split('|').map((s) => s.trim())

  for (const segment of segments) {
    if (segment.startsWith('engine:')) params.set('engine', segment)
    else if (segment.startsWith('transmission:')) params.set('transmission', segment)
    else if (segment.startsWith('drivetrain:')) params.set('drivetrain', segment)
  }

  const qs = params.toString()
  if (qs) path += `?${qs}`
  return path
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Icon className="w-4 h-4 text-zinc-500 shrink-0" />
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-200 ml-auto text-right">{value}</span>
    </div>
  )
}

export function ListingDetailDrawer({ listing, open, onOpenChange }: ListingDetailDrawerProps) {
  const navigate = useNavigate()

  if (!listing) return null

  const damaged = listing.isDamaged || DAMAGED_TITLE_RE.test(listing.title)
  const hasEstimate = listing.estimateAvg !== null
  const hasProfit = listing.profit !== null
  const hasCta = hasEstimate && listing.generationId

  const handleOpenAvito = () => {
    const tg = window.Telegram?.WebApp
    if (tg?.openLink) {
      tg.openLink(listing.url)
    } else {
      window.open(listing.url, '_blank')
    }
  }

  const handleShare = () => {
    const tg = window.Telegram?.WebApp
    const deepLink = `https://t.me/vrazbore_bot?startapp=listing_${listing.id}`

    let shareText = `${listing.title} — ${formatMoney(listing.price)}`
    if (hasProfit && listing.profit !== null) {
      shareText += `\nПрибыль разбора: ~${formatMoney(listing.profit)}`
    }

    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(deepLink)}&text=${encodeURIComponent(shareText)}`

    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl)
    } else {
      window.open(shareUrl, '_blank')
    }
  }

  const handleDetailedCalc = () => {
    if (listing.generationId) {
      onOpenChange(false)
      navigate(buildEstimationPath(listing.generationId, listing.configGroups))
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined} className="max-h-[90vh]">
        <div className="overflow-auto">
          <DrawerHeader className="text-left">
            <DrawerTitle className="text-base leading-snug">{listing.title}</DrawerTitle>
            {damaged && (
              <div className="flex items-center gap-1.5 mt-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs text-amber-500 font-medium">Битый / не на ходу</span>
              </div>
            )}
            {!listing.isActive && (
              <span className="text-xs text-red-400 mt-1 block">Снято с продажи</span>
            )}
          </DrawerHeader>

          {listing.imageUrl && (
            <div className="px-4 mb-3">
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full aspect-video object-cover rounded-xl bg-zinc-800"
              />
            </div>
          )}

          <div className="px-4">
            {hasProfit && listing.profit !== null && (
              <div className="mb-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm text-zinc-400">Маржа разбора</span>
                  <button
                    type="button"
                    className="text-zinc-500 text-[11px] leading-none border border-zinc-600 rounded-full w-4 h-4 inline-flex items-center justify-center active:opacity-70"
                    onClick={() => {
                      const tg = window.Telegram?.WebApp
                      const msg = 'Маржа разбора — расчётная прибыль при условии, что все кузовные элементы и силовые агрегаты целые.\n\nЕсли есть повреждения — нажмите «Подробный расчёт» для точной оценки с учётом дефектов.'
                      if (tg?.showPopup) {
                        tg.showPopup({ message: msg, buttons: [{ type: 'ok' }] })
                      } else {
                        alert(msg)
                      }
                    }}
                  >
                    ?
                  </button>
                </div>
                <div className={cn(
                  'text-3xl font-bold mt-0.5',
                  damaged ? 'text-amber-400' : listing.profit >= 0 ? 'text-green-400' : 'text-red-400',
                )}>
                  {damaged ? '≈' : ''}{listing.profit >= 0 ? '+' : ''}{formatMoney(listing.profit)}
                </div>
                {listing.profitPercent !== null && (
                  <span className={cn(
                    'text-sm font-medium',
                    listing.profitPercent >= 0 ? 'text-green-400/70' : 'text-red-400/70',
                  )}>
                    {listing.profitPercent >= 0 ? '+' : ''}{Math.round(listing.profitPercent)}%
                  </span>
                )}
                <div className="text-sm text-zinc-500 mt-1">
                  Цена авто: {formatMoney(listing.price)}
                </div>
                {damaged && (
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Приблизительно — без учёта повреждений
                  </p>
                )}
              </div>
            )}

            <div className="bg-zinc-800/50 rounded-xl px-3 py-2 mb-3">
              {listing.year && (
                <InfoRow icon={Calendar} label="Год" value={String(listing.year)} />
              )}
              {listing.mileage !== null && (
                <InfoRow icon={Gauge} label="Пробег" value={formatMileage(listing.mileage)} />
              )}
              {listing.engineVolume && (
                <InfoRow icon={Car} label="Двигатель" value={listing.engineVolume} />
              )}
              {listing.transmission && (
                <InfoRow icon={Settings} label="КПП" value={formatTransmission(listing.transmission)} />
              )}
              <InfoRow icon={MapPin} label="Город" value={listing.city} />
              <InfoRow icon={User} label="Продавец" value={formatSellerType(listing.sellerType)} />
              {listing.publishedAt && (
                <InfoRow icon={Calendar} label="Дата" value={formatPublishedAt(listing.publishedAt)} />
              )}
            </div>
          </div>
        </div>

        <DrawerFooter className="gap-2 pb-6">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleOpenAvito}
              className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-zinc-200 rounded-xl py-3 text-sm font-medium active:opacity-80"
            >
              <ExternalLink className="w-4 h-4" />
              Открыть на Avito
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 bg-zinc-800 text-zinc-200 rounded-xl py-3 px-4 text-sm font-medium active:opacity-80"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          {hasCta && (
            <button
              type="button"
              onClick={handleDetailedCalc}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black rounded-xl py-3 text-sm font-bold active:opacity-80"
            >
              <Calculator className="w-4 h-4" />
              Есть повреждения? Уточнить расчёт
            </button>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
