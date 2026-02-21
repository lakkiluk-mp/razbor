import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { DataTable } from '@/components/admin/data-table'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'

interface Subscription {
  id: string
  userId: string
  plan: string
  status: string
  credits: number
  creditsTotal: number
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  userName: string | null
  userUsername: string | null
}

interface AdminSubscriptionsResponse {
  adminSubscriptions: {
    items: Subscription[]
    totalCount: number
  }
}

const PAGE_SIZE = 20

const statusFilters = [
  { key: '', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'past_due', label: 'Past Due' },
  { key: 'canceled', label: 'Canceled' },
  { key: 'expired', label: 'Expired' },
] as const

export function AdminSubscriptionsPage() {
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order)
    setPage(0)
  }

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['adminSubscriptions', page, statusFilter, sortBy, sortOrder],
    queryFn: () =>
      fetchGraphQL<AdminSubscriptionsResponse>(queries.adminSubscriptions, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
      }),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  const columns = [
    {
      key: 'user',
      header: 'Пользователь',
      render: (item: Subscription) =>
        item.userUsername ? `@${item.userUsername}` : item.userName || '-',
    },
    { key: 'plan', header: 'План', sortable: true, sortKey: 'plan' },
    {
      key: 'status',
      header: 'Статус',
      sortable: true,
      sortKey: 'status',
      render: (item: Subscription) => {
        const colors: Record<string, string> = {
          active: 'text-green-500',
          past_due: 'text-red-500',
          canceled: 'text-zinc-400',
          expired: 'text-zinc-500',
        }
        return (
          <span className={colors[item.status] ?? 'text-zinc-400'}>
            {item.status}
          </span>
        )
      },
    },
    {
      key: 'credits',
      header: 'Кредиты',
      sortable: true,
      sortKey: 'credits',
      render: (item: Subscription) => `${item.credits}/${item.creditsTotal}`,
    },
    {
      key: 'period',
      header: 'Период',
      sortable: true,
      sortKey: 'currentPeriodEnd',
      render: (item: Subscription) =>
        `${formatDate(item.currentPeriodStart)} \u2014 ${formatDate(item.currentPeriodEnd)}`,
    },
    {
      key: 'cancelAtPeriodEnd',
      header: 'Отмена',
      render: (item: Subscription) => (
        <span className={item.cancelAtPeriodEnd ? 'text-red-500' : 'text-zinc-600'}>
          {item.cancelAtPeriodEnd ? '\u2713' : '\u2717'}
        </span>
      ),
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Подписки</h2>
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-4">
        <div className="flex gap-1 min-w-max">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setStatusFilter(f.key)
                setPage(0)
              }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                statusFilter === f.key
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'text-zinc-400 active:text-zinc-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <DataTable<Subscription>
        columns={columns}
        data={data?.adminSubscriptions.items ?? []}
        isLoading={isLoading}
        isStale={isPlaceholderData}
        page={page}
        totalCount={data?.adminSubscriptions.totalCount ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  )
}
