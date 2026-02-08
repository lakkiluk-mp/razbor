import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { formatPrice } from '@razbor/shared'
import { ExternalLink } from 'lucide-react'

interface PriceSource {
  source: string
  min: number
  max: number
  minPriceUrl?: string | null
  maxPriceUrl?: string | null
  sampleSize: number
}

interface PriceDetailsDrawerProps {
  partName: string
  oemCode?: string | null
  price: {
    median: number
    min: number
    max: number
    count: number
    minPriceUrl?: string | null
    maxPriceUrl?: string | null
    medianPriceUrl?: string | null
    sources?: PriceSource[] | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const isValidUrl = (url: string | null | undefined): url is string =>
  !!url && /^https?:\/\//.test(url)

const getSourceLabel = (source: string): string => {
  switch (source) {
    case 'drom':
      return 'Drom'
    case 'avito':
      return 'Avito'
    default:
      return source.charAt(0).toUpperCase() + source.slice(1)
  }
}

const openExternalLink = (url: string) => {
  const tg = window.Telegram?.WebApp
  if (tg?.openLink) {
    tg.openLink(url, { try_instant_view: false })
  } else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

function SourceLinks({
  sources,
  type,
}: {
  sources: PriceSource[] | null | undefined
  type: 'min' | 'max'
}) {
  if (!sources || sources.length === 0) return null

  const urlField = type === 'min' ? 'minPriceUrl' : 'maxPriceUrl'

  return (
    <div className="flex flex-col items-end gap-0.5 mt-1">
      {sources.map((s) => {
        const url = s[urlField]
        const hasUrl = isValidUrl(url)

        return (
          <button
            key={s.source}
            type="button"
            disabled={!hasUrl}
            className={`flex items-center gap-1.5 text-sm min-h-[44px] px-2 -mr-2 ${
              hasUrl
                ? 'text-zinc-400 active:text-amber-400'
                : 'text-zinc-500'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              if (hasUrl) openExternalLink(url)
            }}
          >
            <span>{getSourceLabel(s.source)}: {formatPrice(type === 'min' ? s.min : s.max)} ₽</span>
            {hasUrl && <ExternalLink className="w-4 h-4" />}
          </button>
        )
      })}
    </div>
  )
}

export function PriceDetailsDrawer({
  partName,
  oemCode,
  price,
  open,
  onOpenChange,
}: PriceDetailsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader className="text-left">
          <DrawerTitle>{partName}</DrawerTitle>
          {oemCode && (
            <p className="text-xs text-zinc-500 mt-1">Артикул: {oemCode}</p>
          )}
        </DrawerHeader>
        <div className="px-4 pb-8">
          {price ? (
            <div className="space-y-3">
              <div className="flex items-start justify-between py-3">
                <span className="text-sm font-medium text-zinc-400">Минимальная</span>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-zinc-300">
                    {formatPrice(price.min)} ₽
                  </span>
                  <SourceLinks sources={price.sources} type="min" />
                </div>
              </div>
              <div className="flex items-start justify-between py-3">
                <span className="text-sm font-medium text-zinc-400">Максимальная</span>
                <div className="flex flex-col items-end">
                  <span className="text-sm text-zinc-300">
                    {formatPrice(price.max)} ₽
                  </span>
                  <SourceLinks sources={price.sources} type="max" />
                </div>
              </div>
              <div className="flex items-center justify-between py-3 bg-zinc-800/50 rounded-xl px-4 -mx-4">
                <span className="text-base font-medium text-zinc-200">
                  Медиана
                </span>
                <span className="text-base font-semibold text-amber-400">
                  {formatPrice(price.median)} ₽
                </span>
              </div>
              <div className="border-t border-zinc-800 my-2" />
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-zinc-400">Объявлений</span>
                <span className="text-sm text-zinc-300">{price.count} шт.</span>
              </div>
            </div>
          ) : (
            <div className="py-6 space-y-2 text-center">
              <p className="text-zinc-300 text-sm">Не удалось найти цену</p>
              <p className="text-zinc-500 text-xs">
                На рынке б/у запчастей не нашлось подходящих объявлений.
                Возможно, эта деталь редко продаётся отдельно.
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
