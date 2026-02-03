'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, X, Info, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { CalculationPart } from '@razbor/hooks'
import { useState, useEffect } from 'react'
import { getRemainingEstimates } from '@/components/features/usage-counter'
import { CALCULATION_PARTS_KEY } from '@/lib/constants'
import { z } from 'zod'
import { PriceDetailsDrawer } from '@/components/features/price-details-drawer'
import { groupPartsByCategory } from '@/lib/category-groups'

const CalculationPartSchema = z.array(
  z.object({
    part: z.object({
      id: z.string(),
      name: z.string(),
      category: z.string(),
      schematicZone: z
        .object({
          id: z.string(),
          code: z.string(),
          name: z.string(),
        })
        .nullable()
        .optional(),
      price: z
        .object({
          median: z.number(),
          min: z.number(),
          max: z.number(),
          count: z.number(),
          minPriceUrl: z.string().nullable().optional(),
          maxPriceUrl: z.string().nullable().optional(),
          medianPriceUrl: z.string().nullable().optional(),
        })
        .nullable()
        .optional(),
    }),
    included: z.boolean(),
    isDamaged: z.boolean(),
    price: z.number(),
  })
)

function ResultContent() {
  const searchParams = useSearchParams()
  const [excludedParts, setExcludedParts] = useState<Set<string>>(new Set())
  const [remaining, setRemaining] = useState(3)
  const [parts, setParts] = useState<CalculationPart[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [selectedPart, setSelectedPart] = useState<{
    name: string
    price: {
      median: number
      min: number
      max: number
      count: number
      minPriceUrl?: string | null
      maxPriceUrl?: string | null
      medianPriceUrl?: string | null
    } | null
  } | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setRemaining(getRemainingEstimates())

    try {
      const storedParts = sessionStorage.getItem(CALCULATION_PARTS_KEY)
      if (storedParts) {
        const parsed = JSON.parse(storedParts)
        const validated = CalculationPartSchema.safeParse(parsed)
        if (validated.success) {
          setParts(validated.data as CalculationPart[])
        }
      }
    } catch {
      setParts([])
    }
    setIsLoaded(true)
  }, [])

  const rawTotalPrice = parseInt(searchParams.get('totalPrice') || '0', 10)
  const initialTotalPrice = Number.isNaN(rawTotalPrice) ? 0 : rawTotalPrice
  const brand = searchParams.get('brand') || ''
  const model = searchParams.get('model') || ''
  const generation = searchParams.get('generation') || ''

  const isPartActive = useCallback(
    (p: CalculationPart) => p.included && !p.isDamaged && !excludedParts.has(p.part.id),
    [excludedParts]
  )

  const totalPrice = useMemo(
    () =>
      parts
        .filter(isPartActive)
        .reduce((sum, p) => sum + p.price, 0),
    [parts, isPartActive]
  )

  const sortedParts = useMemo(
    () => [...parts].sort((a, b) => b.price - a.price),
    [parts]
  )

  const groupedParts = useMemo(
    () => groupPartsByCategory(sortedParts),
    [sortedParts]
  )

  const displayPrice = parts.length > 0 ? totalPrice : initialTotalPrice

  const toggleExclude = (partId: string) => {
    setExcludedParts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(partId)) {
        newSet.delete(partId)
      } else {
        newSet.add(partId)
      }
      return newSet
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
          aria-label="Назад"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </Link>
      </header>

      <div className="px-4 pb-6">
        <p className="text-zinc-500 text-sm mb-2">Расчётная стоимость запчастей</p>
        <h1 className="text-4xl font-bold text-zinc-100">
          {displayPrice.toLocaleString('ru-RU')} <span className="text-2xl">₽</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-2">
          {brand} {model} {generation}
        </p>
      </div>

      <div className="flex-1 px-4 pb-4 overflow-auto">
        <p className="text-zinc-400 text-sm mb-3">Детализация</p>
        {isLoaded && parts.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl px-4 py-6 text-center">
            <p className="text-zinc-500 text-sm">
              Детализация недоступна. Выполните новый расчёт.
            </p>
          </div>
        ) : isLoaded ? (
          <Accordion
            type="multiple"
            defaultValue={groupedParts.length > 0 ? [groupedParts[0].key] : []}
          >
            {groupedParts.map((group) => {
              const activeCount = group.parts.filter(isPartActive).length
              const groupSum = group.parts
                .filter(isPartActive)
                .reduce((sum, p) => sum + p.price, 0)

              return (
                <AccordionItem key={group.key} value={group.key}>
                  <AccordionTrigger>
                    <span className="flex-1 text-left">{group.label}</span>
                    <span className="text-xs text-zinc-400 mr-2 whitespace-nowrap">
                      {activeCount}/{group.parts.length}
                      <span className="ml-2 text-zinc-300">
                        {groupSum.toLocaleString('ru-RU')} ₽
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {group.parts.map((item) => {
                        const isExcluded = excludedParts.has(item.part.id)
                        const isActive = isPartActive(item)

                        return (
                          <div
                            key={item.part.id}
                            className={cn(
                              'bg-zinc-900 rounded-xl px-4 py-3 flex items-center justify-between',
                              item.isDamaged && 'opacity-60'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              {!item.isDamaged && (
                                <Checkbox
                                  checked={isActive}
                                  onCheckedChange={() => toggleExclude(item.part.id)}
                                  className="border-zinc-600 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                />
                              )}
                              <span
                                className={cn(
                                  'text-sm',
                                  item.isDamaged ? 'text-zinc-500' : 'text-zinc-200'
                                )}
                              >
                                {item.part.name}
                              </span>
                            </div>
                            <div className="text-right">
                              {item.isDamaged ? (
                                <span className="text-amber-500 text-xs font-medium">
                                  повреждён
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {item.part.price ? (
                                    <>
                                      <span
                                        className={cn(
                                          'text-sm whitespace-nowrap',
                                          isExcluded ? 'text-zinc-600 line-through' : 'text-zinc-300'
                                        )}
                                      >
                                        {item.price.toLocaleString('ru-RU')} ₽
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedPart({
                                            name: item.part.name,
                                            price: item.part.price ?? null,
                                          })
                                          setDrawerOpen(true)
                                        }}
                                        className="w-11 h-11 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
                                        aria-label="Подробнее о цене"
                                      >
                                        <Info className="w-4 h-4" />
                                      </button>
                                    </>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <span className="text-sm whitespace-nowrap text-zinc-600">
                                        —
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedPart({
                                            name: item.part.name,
                                            price: null,
                                          })
                                          setDrawerOpen(true)
                                        }}
                                        className="w-11 h-11 flex items-center justify-center text-zinc-600 hover:text-zinc-400 transition-colors"
                                        aria-label="Подробнее о цене"
                                      >
                                        <HelpCircle className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        ) : null}
      </div>

      <div className="px-4 pb-4">
        <div className="bg-zinc-900 rounded-xl px-4 py-3 text-center mb-4">
          <span className="text-zinc-400 text-sm">
            Осталось{' '}
            <span className="text-amber-400 font-semibold">{remaining}</span>{' '}
            бесплатных оценки
          </span>
        </div>
      </div>

      <div className="px-4 pb-8">
        <Link href="/">
          <Button className="w-full h-14 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-base font-medium rounded-2xl">
            Новый расчёт
          </Button>
        </Link>
      </div>

      <PriceDetailsDrawer
        partName={selectedPart?.name || ''}
        price={selectedPart?.price || null}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
          <p className="text-zinc-400">Загрузка...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  )
}
