import { useQuery } from '@tanstack/react-query'
import { Users, Calculator, Banknote, Crown, UserPlus, BarChart3 } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { formatMoney } from '@/lib/format'
import type { AdminStatsResponse } from '@/types/admin'

export function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => fetchGraphQL<AdminStatsResponse>(queries.adminStats),
    staleTime: 60 * 1000,
  })

  const stats = data?.adminStats

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
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
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
  )
}
