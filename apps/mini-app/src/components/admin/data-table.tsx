import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortKey?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading: boolean
  isStale?: boolean
  onRowClick?: (item: T) => void
  page?: number
  totalCount?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  isStale = false,
  onRowClick,
  page = 0,
  totalCount = 0,
  pageSize = 20,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = page + 1

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-zinc-500 text-sm">Нет данных</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className={cn('overflow-x-auto -mx-4 px-4 transition-opacity', isStale && 'opacity-50')}>
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-800">
              {columns.map((col) => {
                const fieldKey = col.sortKey || col.key
                const isActive = sortBy === fieldKey

                return (
                  <th
                    key={col.key}
                    className={cn(
                      'text-left text-xs font-medium uppercase tracking-wider py-2 px-3 first:pl-0 last:pr-0 select-none',
                      col.sortable ? 'cursor-pointer group' : '',
                      isActive ? 'text-amber-500' : 'text-zinc-500'
                    )}
                    onClick={() => {
                      if (!col.sortable || !onSort) return
                      if (isActive) {
                        onSort(fieldKey, sortOrder === 'asc' ? 'desc' : 'asc')
                      } else {
                        onSort(fieldKey, 'desc')
                      }
                    }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && isActive && sortOrder === 'asc' && (
                        <ArrowUp className="w-3.5 h-3.5" />
                      )}
                      {col.sortable && isActive && sortOrder === 'desc' && (
                        <ArrowDown className="w-3.5 h-3.5" />
                      )}
                      {col.sortable && !isActive && (
                        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                      )}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr
                key={((item as Record<string, unknown>).id as string) ?? idx}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'border-b border-zinc-800/50',
                  onRowClick && 'cursor-pointer active:bg-zinc-800/50 transition-colors'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="py-2.5 px-3 text-sm text-zinc-300 first:pl-0 last:pr-0"
                  >
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onPageChange && totalCount > pageSize && (
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="flex items-center gap-1 text-sm text-zinc-400 disabled:opacity-30 active:text-zinc-200 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </button>
          <span className="text-xs text-zinc-500">
            Стр. {currentPage} из {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex items-center gap-1 text-sm text-zinc-400 disabled:opacity-30 active:text-zinc-200 transition-colors"
          >
            Далее
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
