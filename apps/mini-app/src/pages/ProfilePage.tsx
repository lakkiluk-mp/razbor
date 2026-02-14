import { useQuery } from '@tanstack/react-query'
import { Crown, Star } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'

interface MeData {
  id: string
  firstName: string
  lastName: string | null
  username: string | null
  isPremium: boolean
  dailyLimit: number
  totalCalculations: number
  freeRemaining: number
  freeResetAt: string | null
}

interface MeResponse {
  me: MeData
}

export function ProfilePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetchGraphQL<MeResponse>(queries.me),
  })

  if (isLoading) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Загрузка...</p>
      </div>
    )
  }

  if (isError || !data?.me) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Ошибка загрузки профиля</p>
      </div>
    )
  }

  const user = data.me
  const initial = user.firstName?.charAt(0).toUpperCase() || '?'
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col px-4 pt-8 pb-6">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
          <span className="text-2xl font-bold text-amber-500">{initial}</span>
        </div>
        <h1 className="text-xl font-bold text-zinc-100 mt-3">{fullName}</h1>
        {user.username && (
          <p className="text-sm text-zinc-500">@{user.username}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-zinc-900 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{user.totalCalculations}</p>
          <p className="text-xs text-zinc-500 mt-1">Расчётов</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">
            {user.freeRemaining}/{user.dailyLimit}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Осталось сегодня</p>
        </div>
      </div>

      <div className="mt-6">
        {user.isPremium ? (
          <div className="bg-amber-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-amber-500">Premium</span>
            </div>
            <span className="text-amber-500 text-sm">Активен</span>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-zinc-100">Получите Premium</span>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Полная история расчётов и безлимитные оценки
            </p>
            <button
              type="button"
              className="text-amber-500 text-sm font-medium mt-2 py-2"
              onClick={() => alert('Скоро')}
            >
              Подробнее
            </button>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6">
        <p className="text-center text-xs text-zinc-600">Razbor v1.0.0</p>
      </div>
    </div>
  )
}
