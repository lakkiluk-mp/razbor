'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { formatPrice } from '@razbor/shared'
import { ExternalLink } from 'lucide-react'

interface PriceDetailsDrawerProps {
  partName: string
  price: {
    median: number
    min: number
    max: number
    count: number
    minPriceUrl?: string | null
    maxPriceUrl?: string | null
    medianPriceUrl?: string | null
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const isValidUrl = (url: string) => /^https?:\/\//.test(url)

export function PriceDetailsDrawer({
  partName,
  price,
  open,
  onOpenChange,
}: PriceDetailsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <DrawerHeader className="text-left">
          <DrawerTitle>{partName}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8">
          {price ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-zinc-400">Минимальная</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-300">
                    {formatPrice(price.min)} ₽
                  </span>
                  {price.minPriceUrl && isValidUrl(price.minPriceUrl) && (
                    <a
                      href={price.minPriceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Открыть объявление с минимальной ценой"
                      className="w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-zinc-400">Максимальная</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-300">
                    {formatPrice(price.max)} ₽
                  </span>
                  {price.maxPriceUrl && isValidUrl(price.maxPriceUrl) && (
                    <a
                      href={price.maxPriceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Открыть объявление с максимальной ценой"
                      className="w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 bg-zinc-800/50 rounded-xl px-4 -mx-4">
                <span className="text-base font-medium text-zinc-200">
                  Медиана
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-amber-400">
                    {formatPrice(price.median)} ₽
                  </span>
                  {price.medianPriceUrl && isValidUrl(price.medianPriceUrl) && (
                    <a
                      href={price.medianPriceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Открыть объявление с медианной ценой"
                      className="w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-amber-400 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
              <div className="border-t border-zinc-800 my-2" />
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-zinc-400">Объявлений</span>
                <span className="text-sm text-zinc-300">{price.count} шт.</span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center">
              <p className="text-zinc-500 text-sm">Данные о ценах недоступны</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
