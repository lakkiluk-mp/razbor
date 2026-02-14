import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Info, HelpCircle } from 'lucide-react'
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
import { CALCULATION_PARTS_KEY } from '@/lib/constants'
import { PriceDetailsDrawer } from '@/components/features/price-details-drawer'
import { PartsSearch } from '@/components/features/parts-search'
import { groupPartsByCategory } from '@/lib/category-groups'

export function ResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [excludedParts, setExcludedParts] = useState<Set<string>>(new Set())
  const [parts, setParts] = useState<CalculationPart[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPart, setSelectedPart] = useState<{
    name: string
    oemCode?: string | null
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
  const [openAccordions, setOpenAccordions] = useState<string[]>([])
  const isInitializedRef = useRef(false)

  useEffect(() => {
    try {
      const storedParts = sessionStorage.getItem(CALCULATION_PARTS_KEY)
      if (storedParts) {
        const parsed = JSON.parse(storedParts)
        if (Array.isArray(parsed)) {
          setParts(parsed as CalculationPart[])
        }
      }
    } catch {
      setParts([])
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return
    tg.BackButton.show()
    const handleBack = () => navigate(-1)
    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
      tg.BackButton.hide()
    }
  }, [navigate])

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

  const filteredGroupedParts = useMemo(() => {
    if (!searchQuery.trim()) return groupedParts

    const query = searchQuery.toLowerCase().trim()
    return groupedParts
      .map((group) => ({
        ...group,
        parts: group.parts.filter((item) =>
          item.part.name.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.parts.length > 0)
  }, [groupedParts, searchQuery])

  useEffect(() => {
    if (!isInitializedRef.current && groupedParts.length > 0 && !searchQuery.trim()) {
      isInitializedRef.current = true
      setOpenAccordions([groupedParts[0]!.key])
    }
  }, [groupedParts, searchQuery])

  const displayPrice = parts.length > 0 ? totalPrice : initialTotalPrice

  const toggleExclude = useCallback((partId: string) => {
    setExcludedParts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(partId)) {
        newSet.delete(partId)
      } else {
        newSet.add(partId)
      }
      return newSet
    })
  }, [])

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-auto">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-zinc-100 text-2xl font-bold">
          {brand} {model} {generation}
        </h1>
      </div>

      <div className="flex-1 px-4 pb-4">
        <p className="text-zinc-400 text-sm mb-3">Детализация</p>
        {isLoaded && parts.length > 0 && (
          <PartsSearch
            value={searchQuery}
            onChange={setSearchQuery}
            className="mb-3"
          />
        )}
        {isLoaded && parts.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl px-4 py-6 text-center">
            <p className="text-zinc-500 text-sm">
              Детализация недоступна. Выполните новый расчёт.
            </p>
          </div>
        ) : isLoaded && filteredGroupedParts.length === 0 && searchQuery ? (
          <div className="bg-zinc-900 rounded-xl px-4 py-6 text-center">
            <p className="text-zinc-500 text-sm">Ничего не найдено</p>
          </div>
        ) : isLoaded ? (
          <Accordion
            type="multiple"
            value={openAccordions}
            onValueChange={setOpenAccordions}
          >
            {filteredGroupedParts.map((group) => {
              const activeCount = group.parts.filter(isPartActive).length
              const groupSum = group.parts
                .filter(isPartActive)
                .reduce((sum, p) => sum + p.price, 0)

              return (
                <AccordionItem key={group.key} value={group.key}>
                  <AccordionTrigger>
                    <span className="flex-1 text-left">{group.label}</span>
                    <span className="text-sm text-zinc-400 mr-2 whitespace-nowrap">
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
                              'rounded-xl px-4 py-3.5 flex items-center justify-between',
                              item.isDamaged
                                ? 'bg-red-500/5 border-l-2 border-red-500/70'
                                : isExcluded
                                  ? 'bg-red-500/5 cursor-pointer active:bg-zinc-800'
                                  : 'bg-zinc-900 cursor-pointer active:bg-zinc-800'
                            )}
                            onClick={!item.isDamaged ? () => toggleExclude(item.part.id) : undefined}
                          >
                            <div className="flex items-center gap-3">
                              {!item.isDamaged && (
                                <Checkbox
                                  checked={isActive}
                                  className="pointer-events-none border-zinc-600 data-[state=checked]:bg-amber-500/20 data-[state=checked]:border-amber-500 data-[state=checked]:text-amber-500"
                                />
                              )}
                              <span
                                className={cn(
                                  'text-[15px]',
                                  item.isDamaged ? 'text-red-400/80' : isExcluded ? 'text-red-400/60' : 'text-zinc-200'
                                )}
                              >
                                {item.part.name}
                              </span>
                            </div>
                            <div className="text-right">
                              {item.isDamaged ? (
                                <span className="text-red-400 text-xs font-medium">
                                  повреждён
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {item.part.price ? (
                                    <>
                                      <span
                                        className={cn(
                                          'text-sm font-semibold whitespace-nowrap',
                                          isExcluded ? 'text-red-400/40 line-through' : 'text-zinc-300'
                                        )}
                                      >
                                        {item.price.toLocaleString('ru-RU')} ₽
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedPart({
                                            name: item.part.name,
                                            oemCode: item.part.oemCode,
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
                                            oemCode: item.part.oemCode,
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

      {isLoaded && parts.length > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="bg-zinc-900 rounded-2xl px-5 py-5 text-center">
            <p className="text-zinc-500 text-sm mb-1">Расчётная стоимость запчастей</p>
            <p className="text-3xl font-bold text-zinc-100">
              {displayPrice.toLocaleString('ru-RU')} <span className="text-xl">₽</span>
            </p>
          </div>
        </div>
      )}

      <div className="px-4 pb-8 pt-3">
        <Link to="/">
          <Button className="w-full h-14 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-base font-medium rounded-2xl">
            Новый расчёт
          </Button>
        </Link>
      </div>

      <PriceDetailsDrawer
        partName={selectedPart?.name || ''}
        oemCode={selectedPart?.oemCode}
        price={selectedPart?.price || null}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
