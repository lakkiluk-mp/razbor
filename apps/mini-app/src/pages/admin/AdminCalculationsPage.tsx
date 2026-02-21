import { useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { DataTable } from '@/components/admin/data-table'
import { formatDate } from '@/lib/format'

interface Calculation {
  id: string
  userId: string
  totalPrice: number
  damagedZonesCount: number
  createdAt: string
  userName: string | null
  userUsername: string | null
  brandName: string
  modelName: string
  generationName: string
}

interface AdminCalculationsResponse {
  adminCalculations: {
    items: Calculation[]
    totalCount: number
  }
}

const PAGE_SIZE = 20

export function AdminCalculationsPage() {
  const [page, setPage] = useState(0)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order)
    setPage(0)
  }

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['adminCalculations', page, sortBy, sortOrder],
    queryFn: () =>
      fetchGraphQL<AdminCalculationsResponse>(queries.adminCalculations, {
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
      render: (item: Calculation) => formatDate(item.createdAt),
    },
    {
      key: 'user',
      header: 'Пользователь',
      render: (item: Calculation) =>
        item.userUsername ? `@${item.userUsername}` : item.userName || '-',
    },
    {
      key: 'car',
      header: 'Авто',
      render: (item: Calculation) =>
        `${item.brandName} ${item.modelName} ${item.generationName}`,
    },
    {
      key: 'totalPrice',
      header: 'Итого',
      sortable: true,
      sortKey: 'totalPrice',
      render: (item: Calculation) => (
        <span className="text-amber-500 font-medium">
          {item.totalPrice.toLocaleString('ru-RU')} &#8381;
        </span>
      ),
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Расчёты</h2>
      <DataTable<Calculation>
        columns={columns}
        data={data?.adminCalculations.items ?? []}
        isLoading={isLoading}
        isStale={isPlaceholderData}
        page={page}
        totalCount={data?.adminCalculations.totalCount ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  )
}
