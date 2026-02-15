import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Crown, Star, Shield } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { PLAN_LABELS } from '@razbor/shared'

interface SubscriptionData {
  id: string
  plan: string
  status: string
  credits: number
  creditsTotal: number
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  daysRemaining: number
}

interface MeData {
  id: string
  firstName: string
  lastName: string | null
  username: string | null
  isPremium: boolean
  totalCalculations: number
  trialCredits: number
  subscriptionCredits: number
  totalCredits: number
  subscription: SubscriptionData | null
}

interface MeResponse {
  me: MeData
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetchGraphQL<MeResponse>(queries.me),
  })

  const { isSuccess: isAdmin } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => fetchGraphQL(queries.adminStats),
    retry: false,
    staleTime: 10 * 60 * 1000,
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
          <p className="text-2xl font-bold text-amber-500">{user.totalCredits}</p>
          <p className="text-xs text-zinc-500 mt-1">Осталось расчётов</p>
        </div>
      </div>

      <div className="mt-6">
        {user.subscription ? (
          <div
            className="bg-amber-500/20 rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate('/subscribe')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-amber-500">
                  Premium · {PLAN_LABELS[user.subscription.plan] ?? user.subscription.plan}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-500/60" />
            </div>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-zinc-300">
                Осталось: {user.subscription.credits} из {user.subscription.creditsTotal} расч.
              </p>
              <p className="text-sm text-zinc-400">
                До: {new Date(user.subscription.currentPeriodEnd).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        ) : (
          <div
            className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-xl p-4 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={() => navigate('/subscribe')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-zinc-100">Получите Premium</span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Полная история расчётов и дополнительные оценки
            </p>
          </div>
        )}
      </div>

      {isAdmin && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="w-full bg-zinc-900 rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-zinc-100">Админ-панель</span>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
      )}

      <div className="mt-auto pt-6">
        <p className="text-center text-xs text-zinc-600">Razbor v1.0.0</p>
      </div>
    </div>
  )
}
