import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CATEGORY_GROUPS } from '@/lib/category-groups'

interface CalculationDetailPart {
  name: string
  category: string
  included: boolean
  isDamaged: boolean
  price: number
}

interface CalculationDetails {
  parts: CalculationDetailPart[]
}

interface Calculation {
  id: string
  totalPrice: number
  createdAt: string
  brandName: string
  modelName: string
  generationName: string
  details: CalculationDetails | null
}

interface CategoryGroup {
  key: string
  label: string
  parts: CalculationDetailPart[]
}

function groupDetailParts(parts: CalculationDetailPart[]): CategoryGroup[] {
  const categoryToGroupKey = new Map<string, string>()
  for (const group of CATEGORY_GROUPS) {
    for (const cat of group.categories) {
      categoryToGroupKey.set(cat, group.key)
    }
  }

  const grouped = new Map<string, CalculationDetailPart[]>()
  for (const group of CATEGORY_GROUPS) {
    grouped.set(group.key, [])
  }

  for (const part of parts) {
    const groupKey = categoryToGroupKey.get(part.category) ?? 'electrical'
    const arr = grouped.get(groupKey)
    if (arr) arr.push(part)
  }

  return CATEGORY_GROUPS.reduce<CategoryGroup[]>((acc, group) => {
    const groupParts = grouped.get(group.key) ?? []
    if (groupParts.length > 0) {
      acc.push({ key: group.key, label: group.label, parts: groupParts })
    }
    return acc
  }, [])
}

function formatCalculationDate(dateStr: string): string {
  const date = new Date(dateStr)
  const datePart = date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timePart = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${datePart}, ${timePart}`
}

export function HistoryDetailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const calculation = location.state as Calculation | undefined

  useEffect(() => {
    if (!calculation) {
      navigate('/history', { replace: true })
    }
  }, [calculation, navigate])

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

  const groupedParts = useMemo(() => {
    if (!calculation?.details?.parts) return []
    return groupDetailParts(calculation.details.parts)
  }, [calculation])

  if (!calculation) return null

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-auto">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold">
          {calculation.brandName} {calculation.modelName}
        </h1>
        <p className="text-zinc-400 text-sm">{calculation.generationName}</p>
        <p className="text-zinc-500 text-xs mt-1">
          Расчёт на момент {formatCalculationDate(calculation.createdAt)}
        </p>
      </div>

      <div className="flex-1 px-4 pb-4">
        {!calculation.details ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-400 text-center">
              Детализация недоступна для этого расчёта
            </p>
          </div>
        ) : (
          <>
            {groupedParts.map((group) => (
              <div key={group.key}>
                <p className="text-zinc-500 text-xs uppercase tracking-wider mt-4 mb-2">
                  {group.label}
                </p>
                <div className="flex flex-col gap-1">
                  {group.parts.map((part, idx) => (
                    <div
                      key={`${group.key}-${idx}`}
                      className="flex items-center justify-between py-2"
                    >
                      {part.isDamaged ? (
                        <>
                          <span className="text-red-400 line-through text-[15px]">
                            {part.name}
                          </span>
                          <span className="text-red-400 text-xs">Повр.</span>
                        </>
                      ) : !part.included ? (
                        <>
                          <span className="text-zinc-500 line-through text-[15px]">
                            {part.name}
                          </span>
                          <span className="text-zinc-500 text-xs">Исключено</span>
                        </>
                      ) : (
                        <>
                          <span className="text-zinc-100 text-[15px]">{part.name}</span>
                          <span className="text-zinc-100 text-sm font-medium whitespace-nowrap ml-4">
                            {part.price > 0
                              ? `${part.price.toLocaleString('ru-RU')} ₽`
                              : '—'}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="border-t border-zinc-800 mt-4 pt-4 flex items-center justify-between">
              <span className="font-bold text-lg">Итого</span>
              <span className="font-bold text-lg text-amber-400">
                {calculation.totalPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
