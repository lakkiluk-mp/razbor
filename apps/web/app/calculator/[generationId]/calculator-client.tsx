'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, X } from 'lucide-react'
import NProgress from 'nprogress'
import { Button } from '@/components/ui/button'
import { DamageSelector } from '@/components/features/damage-selector'
import { incrementUsage } from '@/components/features/usage-counter'
import { fetchGraphQL, mutations } from '@/lib/graphql-client'
import type { GenerationWithParts, CalculationResult } from '@razbor/hooks'
import { CALCULATION_PARTS_KEY } from '@/lib/constants'

interface CalculatorClientProps {
  generation: GenerationWithParts
  generationSlug?: string
  selectedEngine?: string
  selectedTransmission?: string
}

export function CalculatorClient({
  generation,
  generationSlug,
  selectedEngine,
  selectedTransmission,
}: CalculatorClientProps) {
  const router = useRouter()
  const [selectedDamages, setSelectedDamages] = useState<Set<string>>(new Set())
  const [isCalculating, setIsCalculating] = useState(false)

  const brandSlug = generation.model?.brand?.slug || ''
  const modelSlug = generation.model?.slug || ''
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
      NProgress.start()
      router.push('/limit-reached')
      return
    }

    setIsCalculating(true)
    NProgress.start()

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
          },
        }
      )

      sessionStorage.setItem(CALCULATION_PARTS_KEY, JSON.stringify(result.calculate.parts))

      const searchParams = new URLSearchParams({
        totalPrice: result.calculate.totalPrice.toString(),
        brand: brandName,
        model: modelName,
        generation: generation.name,
        damages: Array.from(selectedDamages).join(','),
      })

      NProgress.done()
      router.push(`/result?${searchParams.toString()}`)
    } catch (error) {
      console.error('Calculation error:', error)
      NProgress.done()
      alert('Ошибка при расчёте. Попробуйте ещё раз.')
    } finally {
      setIsCalculating(false)
    }
  }

  const generationSlugValue = generationSlug || generation.slug
  const backHref =
    brandSlug && modelSlug && generationSlugValue
      ? `/${brandSlug}/${modelSlug}/${generationSlugValue}/config`
      : '/'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <Link
          href={backHref}
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </Link>
      </header>

      <div className="px-4 pb-4">
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
