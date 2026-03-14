import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, Users, Bell, Radio, Layers, ShieldAlert, MapPin } from 'lucide-react'
import { fetchGraphQL, queries, mutations } from '@/lib/graphql-client'
import { DataTable } from '@/components/admin/data-table'
import { formatDate } from '@/lib/format'
import { formatMonitorFilters } from '@/lib/monitor-format'
import { cn } from '@/lib/utils'
import type {
  AdminMonitorStatsResponse,
  AdminMonitorSubscriptionsResponse,
  AdminMonitorSubscriptionItem,
  AdminMonitorSettingsResponse,
  AdminSetFreeSlotsClosed,
  AdminStopFreeSlotsResponse,
  AdminResumeFreeSlotsResponse,
  AdminToggleMonitorSubscriptionResponse,
  AdminRegionCrawlStatsResponse,
  AdminSetRegionCrawlPausedResponse,
} from '@/types/admin'

const PAGE_SIZE = 20

type FilterStatus = 'all' | 'active' | 'paused'

export function AdminMonitorPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [showStopConfirm, setShowStopConfirm] = useState(false)
  const [toggleConfirm, setToggleConfirm] = useState<AdminMonitorSubscriptionItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(0)
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => setDebouncedSearch(value), 400)
  }

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order)
    setPage(0)
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!toastMessage) return
    const timer = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [toastMessage])

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ['adminMonitorSettings'],
    queryFn: () => fetchGraphQL<AdminMonitorSettingsResponse>(queries.adminMonitorSettings),
    staleTime: 30 * 1000,
  })

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['adminMonitorSettings'] })
    queryClient.invalidateQueries({ queryKey: ['adminMonitorSubscriptions'] })
    queryClient.invalidateQueries({ queryKey: ['adminMonitorStats'] })
  }

  const setClosedMutation = useMutation({
    mutationFn: (closed: boolean) =>
      fetchGraphQL<AdminSetFreeSlotsClosed>(mutations.adminSetFreeSlotsClosed, { closed }),
    onSuccess: () => invalidateAll(),
    onError: (error: Error) => setToastMessage(error.message),
  })

  const stopMutation = useMutation({
    mutationFn: () =>
      fetchGraphQL<AdminStopFreeSlotsResponse>(mutations.adminStopFreeSlots),
    onSuccess: (data) => {
      setToastMessage(`Деактивировано ${data.adminStopFreeSlots.deactivatedCount} подписок`)
      setShowStopConfirm(false)
      invalidateAll()
    },
    onError: (error: Error) => setToastMessage(error.message),
  })

  const resumeMutation = useMutation({
    mutationFn: () =>
      fetchGraphQL<AdminResumeFreeSlotsResponse>(mutations.adminResumeFreeSlots),
    onSuccess: () => {
      setToastMessage('Бесплатные слоты возобновлены')
      invalidateAll()
    },
    onError: (error: Error) => setToastMessage(error.message),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) =>
      fetchGraphQL<AdminToggleMonitorSubscriptionResponse>(mutations.adminToggleMonitorSubscription, { id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['adminMonitorSubscriptions'] })
      const queryKey = ['adminMonitorSubscriptions', page, debouncedSearch, filterStatus, sortBy, sortOrder]
      const prev = queryClient.getQueryData<AdminMonitorSubscriptionsResponse>(queryKey)
      if (prev) {
        queryClient.setQueryData<AdminMonitorSubscriptionsResponse>(queryKey, {
          adminMonitorSubscriptions: {
            ...prev.adminMonitorSubscriptions,
            items: prev.adminMonitorSubscriptions.items.map((item) =>
              item.id === id ? { ...item, isActive: !item.isActive } : item
            ),
          },
        })
      }
      return { prev, queryKey }
    },
    onError: (error: Error, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(context.queryKey, context.prev)
      }
      setToastMessage(error.message)
    },
    onSettled: () => invalidateAll(),
  })

  const regionCrawlMutation = useMutation({
    mutationFn: (paused: boolean) =>
      fetchGraphQL<AdminSetRegionCrawlPausedResponse>(mutations.adminSetRegionCrawlPaused, { paused }),
    onSuccess: () => {
      invalidateAll()
    },
    onError: (error: Error) => setToastMessage(error.message),
  })

  const settings = settingsData?.adminMonitorSettings

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminMonitorStats'],
    queryFn: () => fetchGraphQL<AdminMonitorStatsResponse>(queries.adminMonitorStats),
    staleTime: 60 * 1000,
  })

  const { data: regionData, isLoading: regionLoading, error: regionError } = useQuery({
    queryKey: ['adminRegionCrawlStats'],
    queryFn: () => fetchGraphQL<AdminRegionCrawlStatsResponse>(queries.adminRegionCrawlStats),
    staleTime: 60 * 1000,
  })

  const isActiveVar = filterStatus === 'all' ? undefined : filterStatus === 'active'

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['adminMonitorSubscriptions', page, debouncedSearch, filterStatus, sortBy, sortOrder],
    queryFn: () =>
      fetchGraphQL<AdminMonitorSubscriptionsResponse>(queries.adminMonitorSubscriptions, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        isActive: isActiveVar,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      }),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  const stats = statsData?.adminMonitorStats

  const statCards = [
    {
      label: '\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439 \u0441 \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u043E\u043C',
      value: stats?.totalMonitorUsers ?? 0,
      icon: Users,
    },
    {
      label: '\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u043F\u043E\u0434\u043F\u0438\u0441\u043E\u043A',
      value: stats?.activeSubscriptions ?? 0,
      icon: Radio,
    },
    {
      label: '\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E',
      value: stats?.totalNotificationsSent ?? 0,
      icon: Bell,
    },
    {
      label: '\u0423\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0433\u0440\u0443\u043F\u043F',
      value: stats?.uniqueGroups ?? 0,
      icon: Layers,
    },
  ]

  const filterButtons: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: '\u0412\u0441\u0435' },
    { key: 'active', label: '\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435' },
    { key: 'paused', label: '\u041F\u0440\u0438\u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043D\u044B\u0435' },
  ]

  const columns = [
    {
      key: 'user',
      header: '\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C',
      render: (item: AdminMonitorSubscriptionItem) => {
        const name = item.userFirstName || '\u2014'
        const username = item.userUsername ? `@${item.userUsername}` : ''
        return (
          <div className="min-w-0">
            <p className="text-sm text-zinc-200 truncate">{name}</p>
            {username && <p className="text-xs text-zinc-500">{username}</p>}
          </div>
        )
      },
    },
    {
      key: 'label',
      header: '\u041F\u043E\u0434\u043F\u0438\u0441\u043A\u0430',
      sortable: true,
      render: (item: AdminMonitorSubscriptionItem) => (
        <span className="text-sm text-zinc-300 truncate max-w-[120px] block">{item.label}</span>
      ),
    },
    {
      key: 'model',
      header: '\u041C\u043E\u0434\u0435\u043B\u044C',
      sortable: true,
      sortKey: 'brandSlug',
      render: (item: AdminMonitorSubscriptionItem) => (
        <span className="text-sm text-zinc-300">{item.brandSlug}/{item.modelSlug}</span>
      ),
    },
    {
      key: 'city',
      header: '\u0413\u043E\u0440\u043E\u0434',
      render: (item: AdminMonitorSubscriptionItem) => (
        <span className="text-sm text-zinc-400">{item.city || '\u2014'}</span>
      ),
    },
    {
      key: 'filters',
      header: '\u0424\u0438\u043B\u044C\u0442\u0440\u044B',
      render: (item: AdminMonitorSubscriptionItem) => (
        <span className="text-xs text-zinc-400">{formatMonitorFilters(item)}</span>
      ),
    },
    {
      key: 'isActive',
      header: '\u0421\u0442\u0430\u0442\u0443\u0441',
      sortable: true,
      render: (item: AdminMonitorSubscriptionItem) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setToggleConfirm(item)
          }}
          disabled={toggleMutation.isPending && toggleMutation.variables === item.id}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50',
            item.isActive ? 'bg-green-500' : 'bg-zinc-700'
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
              item.isActive && 'translate-x-5'
            )}
          />
        </button>
      ),
    },
    {
      key: 'notificationsSent',
      header: '\u0423\u0432\u0435\u0434.',
      sortable: true,
      render: (item: AdminMonitorSubscriptionItem) => (
        <span className="text-sm text-zinc-300">{item.notificationsSent}</span>
      ),
    },
    {
      key: 'lastNotifiedAt',
      header: '\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435',
      sortable: true,
      render: (item: AdminMonitorSubscriptionItem) => (
        <span className="text-xs text-zinc-400">
          {item.lastNotifiedAt ? formatDate(item.lastNotifiedAt) : '\u2014'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: '\u0421\u043E\u0437\u0434\u0430\u043D\u0430',
      sortable: true,
      render: (item: AdminMonitorSubscriptionItem) => (
        <span className="text-xs text-zinc-400">{formatDate(item.createdAt)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Мониторинг</h2>

      {toastMessage && (
        <div className="bg-green-500/15 border border-green-500/30 text-green-400 rounded-xl px-4 py-3 text-sm">
          {toastMessage}
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-zinc-200">Управление бесплатными слотами</span>
        </div>

        {settingsLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-zinc-200">Закрыть регистрацию бесплатных</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Новые бесплатные пользователи не смогут создать подписку мониторинга
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClosedMutation.mutate(!settings?.freeSlotsClosed)}
                disabled={setClosedMutation.isPending}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50',
                  settings?.freeSlotsClosed ? 'bg-amber-500' : 'bg-zinc-700'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                    settings?.freeSlotsClosed && 'translate-x-5'
                  )}
                />
              </button>
            </div>

            <div className="h-px bg-zinc-800" />

            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm text-zinc-200">Остановить бесплатные слоты</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Все активные подписки бесплатных юзеров будут деактивированы
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (settings?.freeSlotsBlocked) {
                    resumeMutation.mutate()
                  } else {
                    setShowStopConfirm(true)
                  }
                }}
                disabled={stopMutation.isPending || resumeMutation.isPending}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50',
                  settings?.freeSlotsBlocked ? 'bg-amber-500' : 'bg-zinc-700'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                    settings?.freeSlotsBlocked && 'translate-x-5'
                  )}
                />
              </button>
            </div>

            {showStopConfirm && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex flex-col gap-2">
                <p className="text-sm text-red-400">
                  Все бесплатные подписки будут деактивированы. Продолжить?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => stopMutation.mutate()}
                    disabled={stopMutation.isPending}
                    className="flex-1 bg-red-500/20 text-red-400 rounded-lg py-2 text-sm font-medium active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {stopMutation.isPending ? 'Остановка...' : 'Подтвердить'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowStopConfirm(false)}
                    className="flex-1 bg-zinc-800 text-zinc-300 rounded-lg py-2 text-sm active:scale-95 transition-transform"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-zinc-600">
          Платные подписчики: без ограничений (3 слота)
        </p>
      </div>

      {statsLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-zinc-900 rounded-xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <card.icon className="w-4 h-4 text-amber-500/60" />
                <span className="text-xs text-zinc-500 leading-tight">{card.label}</span>
              </div>
              <p className="text-xl font-bold text-amber-500">
                {card.value.toLocaleString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-zinc-200">Областной парсинг</span>
          </div>
          <button
            type="button"
            onClick={() => regionCrawlMutation.mutate(!settings?.regionCrawlPaused)}
            disabled={regionCrawlMutation.isPending || settingsLoading}
            className={cn(
              'relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50',
              settings?.regionCrawlPaused ? 'bg-red-500' : 'bg-green-500'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
                settings?.regionCrawlPaused && 'translate-x-5'
              )}
            />
          </button>
        </div>
        {settings?.regionCrawlPaused && (
          <p className="text-xs text-red-400">Парсинг по областям приостановлен</p>
        )}

        {regionError ? (
          <p className="text-xs text-red-400 py-2">Ошибка: {regionError.message}</p>
        ) : regionLoading ? (
          <div className="flex justify-center py-4">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-1">
            {(regionData?.adminRegionCrawlStats ?? []).map((r) => {
              const age = r.lastSeenAt
                ? Math.round((Date.now() - new Date(r.lastSeenAt).getTime()) / 60000)
                : null
              const isStale = age !== null && age > 15
              return (
                <div key={r.regionSlug} className="flex items-center justify-between gap-2 py-1.5 border-b border-zinc-800 last:border-0">
                  <span className="text-sm text-zinc-300">{r.regionName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">
                      {r.activeListings}/{r.totalListings}
                    </span>
                    <span className={cn(
                      'text-xs whitespace-nowrap',
                      isStale ? 'text-red-400' : 'text-green-400'
                    )}>
                      {age !== null ? (age < 60 ? `${age} мин назад` : `${Math.round(age / 60)} ч назад`) : 'нет данных'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder={'\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044E, \u043C\u043E\u0434\u0435\u043B\u0438, \u0433\u043E\u0440\u043E\u0434\u0443...'}
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {filterButtons.map((btn) => (
            <button
              key={btn.key}
              type="button"
              onClick={() => {
                setFilterStatus(btn.key)
                setPage(0)
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                filterStatus === btn.key
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'text-zinc-400 active:text-zinc-200'
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable<AdminMonitorSubscriptionItem>
        columns={columns}
        data={data?.adminMonitorSubscriptions.items ?? []}
        isLoading={isLoading}
        isStale={isPlaceholderData}
        onRowClick={(item) => navigate(`/admin/users/${item.userId}`)}
        page={page}
        totalCount={data?.adminMonitorSubscriptions.totalCount ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />

      {toggleConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setToggleConfirm(null)}>
          <div className="bg-zinc-900 rounded-xl p-5 mx-4 max-w-sm w-full space-y-3" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-zinc-200">
              {toggleConfirm.isActive ? 'Деактивировать' : 'Активировать'} подписку{' '}
              <span className="font-medium text-amber-400">{toggleConfirm.label}</span>
              {toggleConfirm.userUsername && (
                <span className="text-zinc-400"> (@{toggleConfirm.userUsername})</span>
              )}
              ?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  toggleMutation.mutate(toggleConfirm.id)
                  setToggleConfirm(null)
                }}
                className={cn(
                  'flex-1 rounded-lg py-2 text-sm font-medium active:scale-95 transition-transform',
                  toggleConfirm.isActive
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
                )}
              >
                {toggleConfirm.isActive ? 'Деактивировать' : 'Активировать'}
              </button>
              <button
                type="button"
                onClick={() => setToggleConfirm(null)}
                className="flex-1 bg-zinc-800 text-zinc-300 rounded-lg py-2 text-sm active:scale-95 transition-transform"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
