'use client'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

interface PriceDetailsDrawerProps {
  partName: string
  price: {
    median: number
    min: number
    max: number
    count: number
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatPrice(value: number): string {
  return value.toLocaleString('ru-RU')
}

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
                <span className="text-sm text-zinc-300">
                  {formatPrice(price.min)} ₽
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-zinc-400">Максимальная</span>
                <span className="text-sm text-zinc-300">
                  {formatPrice(price.max)} ₽
                </span>
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
            <div className="py-6 text-center">
              <p className="text-zinc-500 text-sm">Данные о ценах недоступны</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
