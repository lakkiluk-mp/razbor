import { useState, useRef, useEffect } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { DataTable } from '@/components/admin/data-table'
import { formatDate } from '@/lib/format'

interface AdminUser {
  id: string
  telegramId: string
  firstName: string
  lastName: string | null
  username: string | null
  isPremium: boolean
  trialCredits: number
  totalCalculations: number
  totalPayments: number
  activeSubscription: boolean
  createdAt: string
}

interface AdminUsersResponse {
  adminUsers: {
    items: AdminUser[]
    totalCount: number
  }
}

const PAGE_SIZE = 20

export function AdminUsersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['adminUsers', page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      fetchGraphQL<AdminUsersResponse>(queries.adminUsers, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      }),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  const columns = [
    { key: 'telegramId', header: 'TG ID' },
    {
      key: 'name',
      header: 'Имя',
      sortable: true,
      sortKey: 'firstName',
      render: (item: AdminUser) =>
        [item.firstName, item.lastName].filter(Boolean).join(' ') || '-',
    },
    {
      key: 'username',
      header: 'Username',
      render: (item: AdminUser) =>
        item.username ? `@${item.username}` : '-',
    },
    { key: 'totalCalculations', header: 'Расчётов', sortable: true },
    { key: 'totalPayments', header: 'Платежей' },
    {
      key: 'activeSubscription',
      header: 'Подписка',
      render: (item: AdminUser) => (
        <span className={item.activeSubscription ? 'text-green-500' : 'text-zinc-600'}>
          {item.activeSubscription ? '\u2713' : '\u2717'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Регистрация',
      sortable: true,
      render: (item: AdminUser) => formatDate(item.createdAt),
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Пользователи</h2>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Поиск по имени, username, TG ID..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>
      <DataTable<AdminUser>
        columns={columns}
        data={data?.adminUsers.items ?? []}
        isLoading={isLoading}
        isStale={isPlaceholderData}
        onRowClick={(item) => navigate(`/admin/users/${item.id}`)}
        page={page}
        totalCount={data?.adminUsers.totalCount ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  )
}
