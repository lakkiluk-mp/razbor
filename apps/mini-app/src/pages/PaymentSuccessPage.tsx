import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { pluralCredits, PLAN_LABELS } from '@razbor/shared'

interface Subscription {
  id: string
  plan: string
  credits: number
  creditsTotal: number
  currentPeriodEnd: string
  daysRemaining: number
}

interface SubscriptionResponse {
  mySubscription: Subscription | null
}

const POLLING_INTERVAL = 3000
const POLLING_TIMEOUT = 30000

export function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    window.Telegram?.WebApp?.BackButton?.hide()
  }, [])

  const { data } = useQuery({
    queryKey: ['mySubscription'],
    queryFn: () => fetchGraphQL<SubscriptionResponse>(queries.mySubscription),
    refetchInterval: (query) => {
      if (timedOut) return false
      const sub = query.state.data?.mySubscription
      if (sub) return false
      return POLLING_INTERVAL
    },
  })

  const subscription = data?.mySubscription

  useEffect(() => {
    if (subscription) return
    const timer = setTimeout(() => setTimedOut(true), POLLING_TIMEOUT)
    return () => clearTimeout(timer)
  }, [subscription])

  const formattedDate = subscription
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : ''

  if (!subscription && !timedOut) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-lg">Активируем подписку...</p>
        </div>
      </div>
    )
  }

  if (!subscription && timedOut) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-500 text-3xl">&#9201;</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold">Платёж обрабатывается</h1>
          <p className="text-zinc-400 text-sm">
            Подписка скоро активируется. Обычно это занимает не более минуты.
            Вы можете вернуться на главную.
          </p>
          <Button
            onClick={() => navigate('/', { replace: true })}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-900 text-base font-semibold rounded-2xl"
          >
            На главную
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-sm space-y-6">
        <div className="flex justify-center">
          <svg
            className="w-20 h-20 animate-success-check"
            viewBox="0 0 80 80"
            fill="none"
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              stroke="#22c55e"
              strokeWidth="4"
              className="animate-success-circle"
            />
            <path
              d="M24 40 L35 51 L56 30"
              stroke="#22c55e"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-success-path"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">Подписка оформлена!</h1>

        {subscription && (
          <div className="bg-zinc-900 rounded-2xl p-5 space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">План</span>
              <span className="text-zinc-100 font-medium">
                Premium &middot; {PLAN_LABELS[subscription.plan] ?? subscription.plan}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Расчёты</span>
              <span className="text-zinc-100 font-medium">
                {subscription.creditsTotal} {pluralCredits(subscription.creditsTotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">Активна до</span>
              <span className="text-zinc-100 font-medium">{formattedDate}</span>
            </div>
          </div>
        )}

        <Button
          onClick={() => navigate('/', { replace: true })}
          className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-900 text-base font-semibold rounded-2xl"
        >
          Начать расчёт
        </Button>
      </div>
    </div>
  )
}
