import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { DataTable } from '@/components/admin/data-table'
import { formatMoney, formatDate } from '@/lib/format'

interface Payment {
  id: string
  userId: string
  yooPaymentId: string
  amount: number
  currency: string
  status: string
  isRecurring: boolean
  createdAt: string
  userName: string | null
  userUsername: string | null
}

interface AdminPaymentsResponse {
  adminPayments: {
    items: Payment[]
    totalCount: number
  }
}

const PAGE_SIZE = 20

export function AdminPaymentsPage() {
  const [page, setPage] = useState(0)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order)
    setPage(0)
  }

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['adminPayments', page, sortBy, sortOrder],
    queryFn: () =>
      fetchGraphQL<AdminPaymentsResponse>(queries.adminPayments, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        sortBy,
        sortOrder,
      }),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  })

  const columns = [
    {
      key: 'createdAt',
      header: 'Дата',
      sortable: true,
      sortKey: 'createdAt',
      render: (item: Payment) => formatDate(item.createdAt),
    },
    {
      key: 'user',
      header: 'Пользователь',
      render: (item: Payment) =>
        item.userUsername ? `@${item.userUsername}` : item.userName || '-',
    },
    {
      key: 'amount',
      header: 'Сумма',
      sortable: true,
      sortKey: 'amount',
      render: (item: Payment) => (
        <span className="text-amber-500 font-medium">{formatMoney(item.amount)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Статус',
      sortable: true,
      sortKey: 'status',
      render: (item: Payment) => (
        <span
          className={
            item.status === 'succeeded'
              ? 'text-green-500'
              : item.status === 'pending'
                ? 'text-amber-500'
                : 'text-zinc-400'
          }
        >
          {item.status}
        </span>
      ),
    },
    {
      key: 'isRecurring',
      header: 'Recurring',
      render: (item: Payment) => (
        <span className={item.isRecurring ? 'text-green-500' : 'text-zinc-600'}>
          {item.isRecurring ? '\u2713' : '\u2717'}
        </span>
      ),
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Платежи YooKassa</h2>
      <DataTable<Payment>
        columns={columns}
        data={data?.adminPayments.items ?? []}
        isLoading={isLoading}
        isStale={isPlaceholderData}
        page={page}
        totalCount={data?.adminPayments.totalCount ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  )
}
