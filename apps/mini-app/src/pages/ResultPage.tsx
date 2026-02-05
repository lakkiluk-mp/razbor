import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useCallback, useMemo, useState, useEffect } from 'react'
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
    if (searchQuery.trim()) {
      setOpenAccordions(filteredGroupedParts.map((g) => g.key))
    }
  }, [searchQuery, filteredGroupedParts])

  useEffect(() => {
    if (groupedParts.length > 0 && openAccordions.length === 0 && !searchQuery.trim()) {
      setOpenAccordions([groupedParts[0]!.key])
    }
  }, [groupedParts, openAccordions.length, searchQuery])

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
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-auto">
      <div className="px-4 pt-6 pb-6">
        <p className="text-zinc-500 text-sm mb-2">Расчётная стоимость запчастей</p>
        <h1 className="text-4xl font-bold text-zinc-100">
          {displayPrice.toLocaleString('ru-RU')} <span className="text-2xl">₽</span>
        </h1>
        <p className="text-zinc-500 text-xs mt-2">
          {brand} {model} {generation}
        </p>
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

      <div className="px-4 pb-8">
        <Link to="/">
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
