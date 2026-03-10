import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Bell, BellOff, Trash2 } from 'lucide-react'
import { fetchGraphQL, queries, mutations } from '@/lib/graphql-client'

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
  updatedAt: string
}

interface MonitorSubscriptionResponse {
  monitorSubscription: MonitorSubscription
}

interface MonitorCitiesResponse {
  monitorCities: { name: string; slug: string }[]
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU')
}

function formatPrice(value: number): string {
  return value.toLocaleString('ru-RU') + ' \u20BD'
}

export function MonitorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['monitorSubscription', id],
    queryFn: () => fetchGraphQL<MonitorSubscriptionResponse>(queries.monitorSubscription, { id }),
    enabled: !!id,
  })

  const { data: citiesData } = useQuery({
    queryKey: ['monitorCities'],
    queryFn: () => fetchGraphQL<MonitorCitiesResponse>(queries.monitorCities),
    staleTime: 24 * 60 * 60 * 1000,
  })

  const pauseMutation = useMutation({
    mutationFn: () => fetchGraphQL(mutations.pauseMonitorSubscription, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitorSubscription', id] })
      queryClient.invalidateQueries({ queryKey: ['monitorSubscriptions'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => fetchGraphQL(mutations.deleteMonitorSubscription, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitorSubscriptions'] })
      navigate('/monitor', { replace: true })
    },
  })

  if (isLoading) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Загрузка...</p>
      </div>
    )
  }

  if (isError || !data?.monitorSubscription) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Ошибка загрузки подписки</p>
      </div>
    )
  }

  const sub = data.monitorSubscription

  const filters: { label: string; value: string }[] = []

  filters.push({ label: 'Авто', value: sub.label })

  if (sub.city) {
    const cityName = citiesData?.monitorCities?.find((c) => c.slug === sub.city)?.name ?? sub.city
    filters.push({ label: 'Город', value: cityName })
  }
  if (sub.priceMin !== null || sub.priceMax !== null) {
    const min = sub.priceMin !== null ? formatPrice(sub.priceMin) : '...'
    const max = sub.priceMax !== null ? formatPrice(sub.priceMax) : '...'
    filters.push({ label: 'Цена', value: `${min} — ${max}` })
  }
  if (sub.yearMin !== null || sub.yearMax !== null) {
    const min = sub.yearMin ?? '...'
    const max = sub.yearMax ?? '...'
    filters.push({ label: 'Год', value: `${min} — ${max}` })
  }
  if (sub.mileageMax !== null) {
    filters.push({ label: 'Макс. пробег', value: `${(sub.mileageMax / 1000).toFixed(0)} тыс. км` })
  }
  if (sub.searchRadius !== null) {
    filters.push({ label: 'Радиус поиска', value: `+${sub.searchRadius} км` })
  }

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col overflow-auto">
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/monitor')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-300" />
        </button>
        <h1 className="text-xl font-bold flex-1 truncate">{sub.label}</h1>
        <span
          className={`text-xs px-2.5 py-1 rounded-full shrink-0 ${
            sub.isActive
              ? 'bg-green-500/20 text-green-400'
              : 'bg-zinc-800 text-zinc-500'
          }`}
        >
          {sub.isActive ? 'Активна' : 'Пауза'}
        </span>
      </header>

      <div className="flex-1 px-4 pb-4 flex flex-col gap-4">
        <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3">
          {filters.map((f) => (
            <div key={f.label} className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm">{f.label}</span>
              <span className="text-zinc-100 text-sm font-medium">{f.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Уведомлений отправлено</span>
            <span className="text-zinc-100 text-sm font-medium">{sub.notificationsSent}</span>
          </div>
          {sub.lastNotifiedAt && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm">Последнее уведомление</span>
              <span className="text-zinc-100 text-sm font-medium">
                {formatDate(sub.lastNotifiedAt)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Создана</span>
            <span className="text-zinc-100 text-sm font-medium">{formatDate(sub.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Обновлена</span>
            <span className="text-zinc-100 text-sm font-medium">{formatDate(sub.updatedAt)}</span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <button
            type="button"
            onClick={() => pauseMutation.mutate()}
            disabled={pauseMutation.isPending}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 text-zinc-950 rounded-xl py-3.5 font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            {sub.isActive ? (
              <>
                <BellOff className="w-4 h-4" />
                Поставить на паузу
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Возобновить
              </>
            )}
          </button>

          {showDeleteConfirm ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500/20 text-red-400 rounded-xl py-3 font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50"
              >
                Подтвердить удаление
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-zinc-800 text-zinc-300 rounded-xl py-3 text-sm active:scale-95 transition-transform"
              >
                Отмена
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-red-400 rounded-xl py-3 text-sm active:scale-95 transition-transform"
            >
              <Trash2 className="w-4 h-4" />
              Удалить подписку
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
