import { PLAN_LABELS } from '@razbor/shared'

interface SubscriptionStatusProps {
  subscription: {
    plan: string
    status: string
    credits: number
    creditsTotal: number
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
    daysRemaining: number
  }
}

export function SubscriptionStatus({
  subscription,
}: SubscriptionStatusProps) {
  const {
    plan,
    credits,
    creditsTotal,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    daysRemaining,
  } = subscription

  const progressPercent = creditsTotal > 0
    ? Math.round((credits / creditsTotal) * 100)
    : 0

  const formattedDate = new Date(currentPeriodEnd).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 space-y-4">
      <div>
        <span className="text-zinc-400 text-sm">Текущий план</span>
        <p className="text-white text-lg font-bold mt-0.5">Premium · {PLAN_LABELS[plan] ?? plan}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">
            Осталось: <span className="text-white font-medium">{credits}</span> из {creditsTotal} расч.
          </span>
          <span className="text-zinc-500">{progressPercent}%</span>
        </div>
        <div className="bg-zinc-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">Действует до</span>
        <span className="text-zinc-300">{formattedDate}</span>
      </div>

      {daysRemaining <= 3 && daysRemaining > 0 && (
        <div className="bg-amber-500/10 rounded-xl px-3 py-2">
          <span className="text-amber-500 text-sm font-medium">
            {daysRemaining === 1 ? 'Истекает завтра' : `Истекает через ${daysRemaining} дн.`}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="text-zinc-400 text-sm">Автопродление</span>
        <span
          className={`text-sm font-medium ${
            cancelAtPeriodEnd ? 'text-red-500' : 'text-green-500'
          }`}
        >
          {cancelAtPeriodEnd ? 'Отключено' : 'Вкл'}
        </span>
      </div>
    </div>
  )
}
