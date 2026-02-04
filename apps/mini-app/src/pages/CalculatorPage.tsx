import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DamageSelector } from '@/components/features/damage-selector'
import { incrementUsage } from '@/components/features/usage-counter'
import { fetchGraphQL, queries, mutations } from '@/lib/graphql-client'
import type { GenerationWithParts, CalculationResult } from '@razbor/hooks'
import { CALCULATION_PARTS_KEY } from '@/lib/constants'

interface GenerationByIdResponse {
  generation: GenerationWithParts | null
}

export function CalculatorPage() {
  const { generationId } = useParams<{ generationId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const selectedEngine = searchParams.get('engine') || undefined
  const selectedTransmission = searchParams.get('transmission') || undefined
  const selectedDrivetrain = searchParams.get('drivetrain') || undefined

  const [selectedDamages, setSelectedDamages] = useState<Set<string>>(new Set())
  const [isCalculating, setIsCalculating] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['generationById', generationId],
    queryFn: () =>
      fetchGraphQL<GenerationByIdResponse>(queries.generationById, { id: generationId }),
    enabled: !!generationId,
  })

  const generation = data?.generation

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

  if (isLoading) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Загрузка...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Ошибка загрузки данных</p>
      </div>
    )
  }

  if (!generation) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Поколение не найдено</p>
      </div>
    )
  }

  const brandName = generation.model?.brand?.name || ''
  const modelName = generation.model?.name || ''

  const toggleDamage = (code: string) => {
    setSelectedDamages((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(code)) {
        newSet.delete(code)
      } else {
        newSet.add(code)
      }
      return newSet
    })
  }

  const handleCalculate = async () => {
    const canUse = incrementUsage()
    if (!canUse) {
      navigate('/limit-reached')
      return
    }

    setIsCalculating(true)

    try {
      const result = await fetchGraphQL<{ calculate: CalculationResult }>(
        mutations.calculate,
        {
          input: {
            generationId: generation.id,
            damagedZones: Array.from(selectedDamages),
            excludedParts: [],
            selectedEngine: selectedEngine || null,
            selectedTransmission: selectedTransmission || null,
            selectedDrivetrain: selectedDrivetrain || null,
          },
        }
      )

      sessionStorage.setItem(CALCULATION_PARTS_KEY, JSON.stringify(result.calculate.parts))

      const resultParams = new URLSearchParams({
        totalPrice: result.calculate.totalPrice.toString(),
        brand: brandName,
        model: modelName,
        generation: generation.name,
        damages: Array.from(selectedDamages).join(','),
      })

      navigate(`/result?${resultParams.toString()}`)
    } catch (error) {
      console.error('Calculation error:', error)
      alert('Ошибка при расчёте. Попробуйте ещё раз.')
    } finally {
      setIsCalculating(false)
    }
  }

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-auto">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">Состояние кузова и основных элементов</h1>
        <p className="text-zinc-500 text-sm">
          Укажите что было повреждено
        </p>
      </div>

      <DamageSelector
        selectedDamages={selectedDamages}
        onToggleDamage={toggleDamage}
      />

      <div className="px-4 pb-8 pt-2">
        <Button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-base font-semibold rounded-2xl disabled:opacity-50"
        >
          РАССЧИТАТЬ
        </Button>
      </div>
    </div>
  )
}
