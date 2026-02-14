import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { CalculationCard } from '@/components/features/calculation-card'

interface CalculationDetailPart {
  name: string
  category: string
  included: boolean
  isDamaged: boolean
  price: number
}

interface Calculation {
  id: string
  totalPrice: number
  createdAt: string
  brandName: string
  modelName: string
  generationName: string
  details: { parts: CalculationDetailPart[] } | null
}

interface MyCalculationsResponse {
  myCalculations: Calculation[]
}

interface MeResponse {
  me: {
    id: string
    isPremium: boolean
  }
}

const FAKE_CALCULATIONS = [
  { id: '1', brandName: 'Lada', modelName: 'Vesta', generationName: 'I (2015-2023) Sedan', totalPrice: 487000, date: '12 фев. 2026' },
  { id: '2', brandName: 'Hyundai', modelName: 'Solaris', generationName: 'II (2017-2023) Sedan', totalPrice: 362000, date: '10 фев. 2026' },
  { id: '3', brandName: 'Kia', modelName: 'Rio', generationName: 'IV (2017-2023) Sedan', totalPrice: 415000, date: '8 фев. 2026' },
]

export function HistoryPage() {
  const navigate = useNavigate()

  const { data: meData, isLoading: meLoading, isError: meError } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetchGraphQL<MeResponse>(queries.me),
  })

  const isPremium = meData?.me?.isPremium ?? false

  const { data: calcData, isLoading: calcLoading, isError: calcError } = useQuery({
    queryKey: ['myCalculations'],
    queryFn: () =>
      fetchGraphQL<MyCalculationsResponse>(queries.myCalculations, {
        limit: 50,
        offset: 0,
      }),
    enabled: isPremium,
    staleTime: 0,
  })

  const isLoading = meLoading || (isPremium && calcLoading)
  const isError = meError || calcError

  const calculations = calcData?.myCalculations ?? []

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

  if (isPremium && calculations.length === 0) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col">
        <header className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold">История</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <p className="text-zinc-400 text-center">Пока нет расчётов</p>
          <Link
            to="/"
            className="bg-amber-500 text-zinc-950 rounded-xl px-6 py-3 font-semibold text-sm active:scale-95 transition-transform"
          >
            Начать расчёт
          </Link>
        </div>
      </div>
    )
  }

  if (isPremium) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
        <header className="px-4 pt-6 pb-4">
          <h1 className="text-2xl font-bold">История</h1>
        </header>
        <div className="flex-1 overflow-auto px-4 pb-4 flex flex-col gap-3">
          {calculations.map((calc) => (
            <CalculationCard
              key={calc.id}
              createdAt={calc.createdAt}
              brandName={calc.brandName}
              modelName={calc.modelName}
              generationName={calc.generationName}
              onClick={() => navigate(`/history/${calc.id}`, { state: calc })}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold">История</h1>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <div className="px-4 pb-4 flex flex-col gap-3 blur-md pointer-events-none select-none">
          {FAKE_CALCULATIONS.map((item) => (
            <div key={item.id} className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-zinc-100 font-semibold">
                  {item.brandName} {item.modelName}
                </span>
                <span className="text-zinc-500 text-xs">{item.date}</span>
              </div>
              <span className="text-zinc-400 text-sm">{item.generationName}</span>
              <span className="text-amber-500 font-bold text-lg">
                {item.totalPrice.toLocaleString('ru-RU')} &#8381;
              </span>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8">
          <div className="bg-zinc-900/80 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center gap-3 max-w-xs w-full">
            <Lock className="w-10 h-10 text-zinc-400" />
            <h2 className="text-lg font-bold text-zinc-100 text-center">
              История расчётов
            </h2>
            <p className="text-zinc-400 text-sm text-center leading-relaxed">
              Оформите подписку чтобы просматривать историю всех ваших расчётов
            </p>
            <button
              type="button"
              className="mt-2 w-full bg-amber-500 text-zinc-950 rounded-xl px-6 py-3 font-semibold text-sm active:scale-95 transition-transform"
              onClick={() => alert('Скоро')}
            >
              Разблокировать
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
