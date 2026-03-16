import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Calculator, Banknote, Crown, UserPlus, BarChart3, Radio, Bell, TrendingUp, RefreshCw } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { formatMoney } from '@/lib/format'
import type { AdminStatsResponse, AdminMonitorStatsResponse, AdminUserAnalyticsResponse, AdminRetentionResponse } from '@/types/admin'

const PERIOD_OPTIONS = [
  { label: '7д', value: 7 },
  { label: '14д', value: 14 },
  { label: '30д', value: 30 },
] as const

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export function AdminDashboard() {
  const [analyticsDays, setAnalyticsDays] = useState(14)

  const { data, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => fetchGraphQL<AdminStatsResponse>(queries.adminStats),
    staleTime: 60 * 1000,
  })

  const { data: monitorData } = useQuery({
    queryKey: ['adminMonitorStats'],
    queryFn: () => fetchGraphQL<AdminMonitorStatsResponse>(queries.adminMonitorStats),
    staleTime: 60 * 1000,
  })

  const { data: analyticsData } = useQuery({
    queryKey: ['adminUserAnalytics', analyticsDays],
    queryFn: () => fetchGraphQL<AdminUserAnalyticsResponse>(queries.adminUserAnalytics, { days: analyticsDays }),
    staleTime: 60 * 1000,
  })

  const { data: retentionData } = useQuery({
    queryKey: ['adminRetention'],
    queryFn: () => fetchGraphQL<AdminRetentionResponse>(queries.adminRetention, { cohortDays: 30 }),
    staleTime: 5 * 60 * 1000,
  })

  const stats = data?.adminStats
  const monitorStats = monitorData?.adminMonitorStats
  const analytics = analyticsData?.adminUserAnalytics
  const retention = retentionData?.adminRetention

  const cards = [
    {
      label: 'Всего пользователей',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      format: (v: number) => v.toLocaleString('ru-RU'),
    },
    {
      label: 'Расчётов всего',
      value: stats?.totalCalculations ?? 0,
      icon: Calculator,
      format: (v: number) => v.toLocaleString('ru-RU'),
    },
    {
      label: 'Общий доход',
      value: stats?.totalRevenue ?? 0,
      icon: Banknote,
      format: formatMoney,
    },
    {
      label: 'Активных подписок',
      value: stats?.activeSubscriptions ?? 0,
      icon: Crown,
      format: (v: number) => v.toLocaleString('ru-RU'),
    },
    {
      label: 'Новых сегодня',
      value: stats?.newUsersToday ?? 0,
      icon: UserPlus,
      format: (v: number) => v.toLocaleString('ru-RU'),
    },
    {
      label: 'Расчётов сегодня',
      value: stats?.calculationsToday ?? 0,
      icon: BarChart3,
      format: (v: number) => v.toLocaleString('ru-RU'),
    },
    {
      label: 'Подписок мониторинга',
      value: monitorStats?.activeSubscriptions ?? 0,
      icon: Radio,
      format: (v: number) => v.toLocaleString('ru-RU'),
    },
    {
      label: 'Уведомлений отправлено',
      value: monitorStats?.totalNotificationsSent ?? 0,
      icon: Bell,
      format: (v: number) => v.toLocaleString('ru-RU'),
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-4">Dashboard</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-zinc-900 rounded-xl p-4 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
                <card.icon className="w-4 h-4 text-amber-500/60" />
                <span className="text-xs text-zinc-500 leading-tight">
                  {card.label}
                </span>
              </div>
              <p className="text-xl font-bold text-amber-500">
                {card.format(card.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500/60" />
            <h2 className="text-lg font-bold">Аналитика</h2>
          </div>
          <div className="flex gap-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnalyticsDays(opt.value)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  analyticsDays === opt.value
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {analytics?.totals && (
          <div className="space-y-3 mb-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1.5 flex items-center gap-1">
                <Users className="w-3 h-3" /> Активные пользователи
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-zinc-500">DAU</p>
                  <p className="text-lg font-bold text-amber-500">{analytics.totals.dau}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-zinc-500">WAU</p>
                  <p className="text-lg font-bold text-amber-500">{analytics.totals.wau}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-zinc-500">MAU</p>
                  <p className="text-lg font-bold text-amber-500">{analytics.totals.mau}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1.5 flex items-center gap-1">
                <UserPlus className="w-3 h-3" /> Новые пользователи
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-zinc-500">Сегодня</p>
                  <p className="text-lg font-bold text-green-400">{analytics.totals.newToday}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-zinc-500">7 дней</p>
                  <p className="text-lg font-bold text-green-400">{analytics.totals.newWeek}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-zinc-500">30 дней</p>
                  <p className="text-lg font-bold text-green-400">{analytics.totals.newMonth}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {analytics?.dailyStats && analytics.dailyStats.length > 0 && (
          <div className="bg-zinc-900 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-3 py-2 text-xs text-zinc-500 font-medium">Дата</th>
                    <th className="text-right px-3 py-2 text-xs text-zinc-500 font-medium">Новые</th>
                    <th className="text-right px-3 py-2 text-xs text-zinc-500 font-medium">Расчёты</th>
                    <th className="text-right px-3 py-2 text-xs text-zinc-500 font-medium">Активные</th>
                    <th className="text-right px-3 py-2 text-xs text-zinc-500 font-medium">Расч/юзер</th>
                    <th className="text-right px-3 py-2 text-xs text-zinc-500 font-medium">Конверсия</th>
                  </tr>
                </thead>
                <tbody>
                  {[...analytics.dailyStats].reverse().map((day) => {
                    const isToday = day.date === new Date().toISOString().slice(0, 10)
                    return (
                      <tr
                        key={day.date}
                        className={`border-b border-zinc-800/50 last:border-0 ${isToday ? 'bg-amber-500/5' : ''}`}
                      >
                        <td className="px-3 py-2 text-zinc-300">
                          {formatDate(day.date)}
                          {isToday && <span className="ml-1 text-[10px] text-amber-500">сегодня</span>}
                        </td>
                        <td className="text-right px-3 py-2">
                          <span className={day.newUsers > 0 ? 'text-green-400' : 'text-zinc-600'}>
                            {day.newUsers > 0 ? `+${day.newUsers}` : '0'}
                          </span>
                        </td>
                        <td className="text-right px-3 py-2">
                          <span className={day.calculations > 0 ? 'text-blue-400' : 'text-zinc-600'}>
                            {day.calculations}
                          </span>
                        </td>
                        <td className="text-right px-3 py-2">
                          <span className={day.activeUsers > 0 ? 'text-amber-400' : 'text-zinc-600'}>
                            {day.activeUsers}
                          </span>
                        </td>
                        <td className="text-right px-3 py-2">
                          <span className={day.calculationsPerUser > 0 ? 'text-purple-400' : 'text-zinc-600'}>
                            {day.calculationsPerUser.toFixed(1)}
                          </span>
                        </td>
                        <td className="text-right px-3 py-2">
                          <span className={day.conversionRate > 0 ? 'text-cyan-400' : 'text-zinc-600'}>
                            {day.conversionRate.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {retention && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-5 h-5 text-amber-500/60" />
            <h2 className="text-lg font-bold">Retention</h2>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-zinc-900 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Day 1</p>
              <p className="text-lg font-bold text-amber-500">{retention.averageDay1}%</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Day 7</p>
              <p className="text-lg font-bold text-amber-500">{retention.averageDay7}%</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-3 text-center">
              <p className="text-[10px] text-zinc-500">Day 30</p>
              <p className="text-lg font-bold text-amber-500">{retention.averageDay30}%</p>
            </div>
          </div>

          {retention.cohorts.length > 0 && (
            <div className="bg-zinc-900 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-3 py-2 text-xs text-zinc-500 font-medium">Дата</th>
                      <th className="text-right px-3 py-2 text-xs text-zinc-500 font-medium">Размер</th>
                      <th className="text-right px-3 py-2 text-xs text-zinc-500 font-medium">Day 1</th>
                      <th className="text-right px-3 py-2 text-xs text-zinc-500 font-medium">Day 7</th>
                      <th className="text-right px-3 py-2 text-xs text-zinc-500 font-medium">Day 30</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...retention.cohorts].reverse().map((c) => (
                      <tr key={c.cohortDate} className="border-b border-zinc-800/50 last:border-0">
                        <td className="px-3 py-2 text-zinc-300">{formatDate(c.cohortDate)}</td>
                        <td className="text-right px-3 py-2 text-zinc-400">{c.cohortSize}</td>
                        <td className="text-right px-3 py-2">
                          {c.rateDay1 < 0 ? (
                            <span className="text-zinc-600">&mdash;</span>
                          ) : (
                            <span className={c.rateDay1 > 0 ? 'text-green-400' : 'text-zinc-600'}>
                              {c.retainedDay1} ({c.rateDay1}%)
                            </span>
                          )}
                        </td>
                        <td className="text-right px-3 py-2">
                          {c.rateDay7 < 0 ? (
                            <span className="text-zinc-600">&mdash;</span>
                          ) : (
                            <span className={c.rateDay7 > 0 ? 'text-green-400' : 'text-zinc-600'}>
                              {c.retainedDay7} ({c.rateDay7}%)
                            </span>
                          )}
                        </td>
                        <td className="text-right px-3 py-2">
                          {c.rateDay30 < 0 ? (
                            <span className="text-zinc-600">&mdash;</span>
                          ) : (
                            <span className={c.rateDay30 > 0 ? 'text-green-400' : 'text-zinc-600'}>
                              {c.retainedDay30} ({c.rateDay30}%)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
