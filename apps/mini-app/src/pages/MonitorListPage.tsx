import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Bell, BellOff, Trash2, AlertTriangle } from 'lucide-react'
import { fetchGraphQL, queries, mutations } from '@/lib/graphql-client'

interface MeResponse {
  me: {
    monitorSlotLimit: number
  }
}

interface MonitorSubscription {
  id: string
  label: string
  brandSlug: string
  modelSlug: string
  city: string | null
  priceMin: number | null
  priceMax: number | null
  yearMin: number | null
  yearMax: number | null
  mileageMax: number | null
  searchRadius: number | null
  isActive: boolean
  notificationsSent: number
  lastNotifiedAt: string | null
  createdAt: string
}

interface MonitorSubscriptionsResponse {
  monitorSubscriptions: MonitorSubscription[]
}

function formatFilters(sub: MonitorSubscription): string {
  const parts: string[] = []
  if (sub.city) parts.push(sub.city)
  if (sub.yearMin || sub.yearMax) {
    parts.push(`${sub.yearMin ?? '...'}-${sub.yearMax ?? '...'} г.`)
  }
  if (sub.priceMin || sub.priceMax) {
    const min = sub.priceMin ? `${(sub.priceMin / 1000).toFixed(0)}т` : '...'
    const max = sub.priceMax ? `${(sub.priceMax / 1000).toFixed(0)}т` : '...'
    parts.push(`${min}-${max} ₽`)
  }
  if (sub.mileageMax) {
    parts.push(`до ${(sub.mileageMax / 1000).toFixed(0)}т км`)
  }
  if (sub.searchRadius) {
    parts.push(`+${sub.searchRadius} км`)
  }
  return parts.join(' · ')
}

export function MonitorListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [pendingPauseId, setPendingPauseId] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [showLimitHint, setShowLimitHint] = useState(false)
  const [freeSlotsBlocked, setFreeSlotsBlocked] = useState(false)

  const { data: meData } = useQuery({
    queryKey: ['me'],
    queryFn: () => fetchGraphQL<MeResponse>(queries.me),
  })


  const { data, isLoading, isError } = useQuery({
    queryKey: ['monitorSubscriptions'],
    queryFn: () => fetchGraphQL<MonitorSubscriptionsResponse>(queries.monitorSubscriptions),
  })

  const pauseMutation = useMutation({
    mutationFn: (id: string) =>
      fetchGraphQL(mutations.pauseMonitorSubscription, { id }),
    onMutate: (id) => setPendingPauseId(id),
    onSettled: () => {
      setPendingPauseId(null)
      queryClient.invalidateQueries({ queryKey: ['monitorSubscriptions'] })
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === 'FREE_SLOTS_BLOCKED') {
        setFreeSlotsBlocked(true)
      } else {
        alert(error.message)
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetchGraphQL(mutations.deleteMonitorSubscription, { id }),
    onMutate: (id) => setPendingDeleteId(id),
    onSettled: () => {
      setPendingDeleteId(null)
      setShowDeleteConfirm(null)
      queryClient.invalidateQueries({ queryKey: ['monitorSubscriptions'] })
    },
  })

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
        <p className="text-zinc-400">Ошибка загрузки</p>
      </div>
    )
  }

  const subscriptions = data?.monitorSubscriptions ?? []
  const slotLimit = meData?.me?.monitorSlotLimit ?? 1
  const activeCount = subscriptions.filter(s => s.isActive).length
  const isLimitReached = activeCount >= slotLimit
  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="px-4 pt-6 pb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Мониторинг</h1>
          <button
            type="button"
            onClick={() => {
              if (isLimitReached) {
                setShowLimitHint(true)
                setTimeout(() => setShowLimitHint(false), 3000)
              } else {
                navigate('/monitor/new')
              }
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform ${
              isLimitReached ? 'bg-zinc-700' : 'bg-amber-500'
            }`}
          >
            <Plus className={`w-5 h-5 ${isLimitReached ? 'text-zinc-400' : 'text-zinc-950'}`} />
          </button>
        </div>
        {showLimitHint && (
          <p className="text-amber-400 text-sm">
            Лимит подписок ({slotLimit}). Удалите или приостановите существующую.
          </p>
        )}
      </header>

      {freeSlotsBlocked && (
        <div className="mx-4 mb-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="text-sm font-semibold text-amber-400">Мониторинг приостановлен</p>
          </div>
          <p className="text-xs text-zinc-400">
            Из-за высокой нагрузки мониторинг для бесплатных аккаунтов приостановлен. Оформите подписку для восстановления мониторинга.
          </p>
          <button
            type="button"
            onClick={() => navigate('/subscribe')}
            className="bg-amber-500 text-zinc-950 rounded-xl px-4 py-2.5 font-semibold text-sm active:scale-95 transition-transform mt-1"
          >
            Оформить подписку
          </button>
        </div>
      )}

      {subscriptions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <Bell className="w-12 h-12 text-zinc-700" />
          <p className="text-zinc-400 text-center font-semibold">
            Отслеживание объявлений на Авито
          </p>
          <p className="text-zinc-500 text-sm text-center leading-relaxed">
            Вставьте ссылку на объявление или поиск с Авито — мы определим марку и модель, и будем присылать новые объявления прямо в Telegram
          </p>
          <button
            type="button"
            onClick={() => navigate('/monitor/new')}
            className="bg-amber-500 text-zinc-950 rounded-xl px-6 py-3 font-semibold text-sm active:scale-95 transition-transform"
          >
            Создать подписку
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-4 pb-4 flex flex-col gap-3">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-2"
            >
              <div
                className="flex items-start justify-between cursor-pointer active:scale-[0.99] transition-transform"
                onClick={() => navigate(`/monitor/${sub.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-100 font-semibold truncate">{sub.label}</p>
                  <p className="text-zinc-400 text-sm mt-0.5">
                    {formatFilters(sub) || 'Без фильтров'}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    sub.isActive
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {sub.isActive ? 'Активна' : 'Пауза'}
                </span>
              </div>

              {sub.notificationsSent > 0 && (
                <p className="text-zinc-500 text-xs">
                  Найдено объявлений: {sub.notificationsSent}
                </p>
              )}

              {showDeleteConfirm === sub.id ? (
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => deleteMutation.mutate(sub.id)}
                    disabled={pendingDeleteId === sub.id}
                    className="flex-1 bg-red-500/20 text-red-400 rounded-xl py-2.5 font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50"
                  >
                    Подтвердить
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-zinc-800 text-zinc-300 rounded-xl py-2.5 text-sm active:scale-95 transition-transform"
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => pauseMutation.mutate(sub.id)}
                    disabled={pendingPauseId === sub.id}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 rounded-xl py-2.5 text-sm text-zinc-300 active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {sub.isActive ? (
                      <>
                        <BellOff className="w-4 h-4" />
                        Пауза
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4" />
                        Возобновить
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(sub.id)}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-xl text-red-400 active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
