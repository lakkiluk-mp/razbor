import { useState, useEffect } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { DataTable } from '@/components/admin/data-table'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { AdminMonitorLogsResponse, AdminMonitorLogItem } from '@/types/admin'

const PAGE_SIZE = 30

const LOG_TYPES = ['CRAWL', 'NOTIFICATION', 'PROXY', 'STRATEGY', 'SYSTEM'] as const
const LOG_LEVELS = ['ERROR', 'WARN', 'INFO', 'DEBUG'] as const

const levelColors: Record<string, string> = {
  ERROR: 'bg-red-500/15 text-red-500',
  WARN: 'bg-amber-500/15 text-amber-500',
  INFO: 'bg-zinc-700/50 text-zinc-300',
  DEBUG: 'bg-zinc-800/50 text-zinc-500',
}

export function AdminMonitorLogsPage() {
  const [page, setPage] = useState(0)
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [levelFilter, setLevelFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortBy(field)
    setSortOrder(order)
    setPage(0)
  }

  useEffect(() => {
    setExpandedId(null)
  }, [typeFilter, levelFilter, page])

  const { data, isLoading, isPlaceholderData } = useQuery({
    queryKey: ['adminMonitorLogs', page, typeFilter, levelFilter, sortBy, sortOrder],
    queryFn: () =>
      fetchGraphQL<AdminMonitorLogsResponse>(queries.adminMonitorLogs, {
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
        type: typeFilter || undefined,
        level: levelFilter || undefined,
        sortBy,
        sortOrder,
      }),
    staleTime: 15 * 1000,
    placeholderData: keepPreviousData,
  })

  const columns = [
    {
      key: 'createdAt',
      header: '\u0412\u0440\u0435\u043C\u044F',
      sortable: true,
      render: (item: AdminMonitorLogItem) => (
        <span className="text-xs text-zinc-400 whitespace-nowrap">{formatDate(item.createdAt)}</span>
      ),
    },
    {
      key: 'type',
      header: '\u0422\u0438\u043F',
      sortable: true,
      render: (item: AdminMonitorLogItem) => (
        <span className="text-xs text-zinc-300 font-mono">{item.type}</span>
      ),
    },
    {
      key: 'level',
      header: '\u0423\u0440\u043E\u0432\u0435\u043D\u044C',
      sortable: true,
      render: (item: AdminMonitorLogItem) => (
        <span
          className={cn(
            'px-2 py-0.5 rounded-md text-xs font-medium',
            levelColors[item.level] ?? 'bg-zinc-800 text-zinc-400'
          )}
        >
          {item.level}
        </span>
      ),
    },
    {
      key: 'model',
      header: '\u041C\u043E\u0434\u0435\u043B\u044C',
      render: (item: AdminMonitorLogItem) => {
        if (!item.brandSlug && !item.modelSlug) return <span className="text-zinc-600">{'\u2014'}</span>
        return (
          <span className="text-sm text-zinc-300">
            {[item.brandSlug, item.modelSlug].filter(Boolean).join('/')}
          </span>
        )
      },
    },
    {
      key: 'message',
      header: '\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435',
      render: (item: AdminMonitorLogItem) => (
        <div className="min-w-0">
          <p className="text-sm text-zinc-300 truncate max-w-[300px]">{item.message}</p>
          {item.meta && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setExpandedId(expandedId === item.id ? null : item.id)
              }}
              className="text-xs text-amber-500/70 hover:text-amber-500 mt-0.5"
            >
              {expandedId === item.id ? '\u0421\u043A\u0440\u044B\u0442\u044C meta' : '\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C meta'}
            </button>
          )}
          {expandedId === item.id && item.meta && (
            <pre className="text-xs text-zinc-500 mt-1 whitespace-pre-wrap break-all bg-zinc-800/50 rounded p-2 max-w-[400px] overflow-x-auto">
              {formatMeta(item.meta)}
            </pre>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">{'\u041B\u043E\u0433\u0438 \u043C\u043E\u043D\u0438\u0442\u043E\u0440\u0438\u043D\u0433\u0430'}</h2>

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{'\u0422\u0438\u043F:'}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => { setTypeFilter(''); setPage(0) }}
              className={cn(
                'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                !typeFilter ? 'bg-amber-500/15 text-amber-500' : 'text-zinc-400 active:text-zinc-200'
              )}
            >
              {'\u0412\u0441\u0435'}
            </button>
            {LOG_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTypeFilter(t); setPage(0) }}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                  typeFilter === t ? 'bg-amber-500/15 text-amber-500' : 'text-zinc-400 active:text-zinc-200'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">{'\u0423\u0440\u043E\u0432\u0435\u043D\u044C:'}</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => { setLevelFilter(''); setPage(0) }}
              className={cn(
                'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                !levelFilter ? 'bg-amber-500/15 text-amber-500' : 'text-zinc-400 active:text-zinc-200'
              )}
            >
              {'\u0412\u0441\u0435'}
            </button>
            {LOG_LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => { setLevelFilter(l); setPage(0) }}
                className={cn(
                  'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                  levelFilter === l
                    ? levelColors[l]
                    : 'text-zinc-400 active:text-zinc-200'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable<AdminMonitorLogItem>
        columns={columns}
        data={data?.adminMonitorLogs.items ?? []}
        isLoading={isLoading}
        isStale={isPlaceholderData}
        page={page}
        totalCount={data?.adminMonitorLogs.totalCount ?? 0}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  )
}

function formatMeta(meta: string): string {
  try {
    return JSON.stringify(JSON.parse(meta), null, 2)
  } catch {
    return meta
  }
}
