import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import { cn } from '@/lib/utils'
import { formatMoney, formatDate } from '@/lib/format'

interface Calculation {
  id: string
  totalPrice: number
  damagedZonesCount: number
  createdAt: string
  brandName: string
  modelName: string
  generationName: string
}

interface YooPayment {
  id: string
  yooPaymentId: string
  amount: number
  currency: string
  status: string
  isRecurring: boolean
  createdAt: string
}

interface Subscription {
  id: string
  plan: string
  status: string
  credits: number
  creditsTotal: number
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
}

interface UsageLog {
  id: string
  action: string
  metadata: string | null
  createdAt: string
}

interface AdminUserData {
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
  calculations: Calculation[]
  yooPayments: YooPayment[]
  subscriptions: Subscription[]
  recentUsageLogs: UsageLog[]
}

interface AdminUserResponse {
  adminUser: AdminUserData
}

const sectionTabs = [
  { key: 'calculations', label: 'Расчёты' },
  { key: 'yoo', label: 'YooKassa' },
  { key: 'subs', label: 'Подписки' },
  { key: 'logs', label: 'Логи' },
] as const

type SectionKey = (typeof sectionTabs)[number]['key']

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState<SectionKey>('calculations')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['adminUser', id],
    queryFn: () => fetchGraphQL<AdminUserResponse>(queries.adminUser, { id }),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !data?.adminUser) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <p className="text-zinc-400 text-sm">Пользователь не найден</p>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="text-amber-500 text-sm"
        >
          Назад к списку
        </button>
      </div>
    )
  }

  const user = data.adminUser

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-1 text-sm text-zinc-400 active:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Пользователи
      </button>

      <div className="bg-zinc-900 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <span className="text-lg font-bold text-amber-500">
              {user.firstName?.charAt(0).toUpperCase() || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold truncate">
              {[user.firstName, user.lastName].filter(Boolean).join(' ')}
            </h2>
            {user.username && (
              <p className="text-sm text-zinc-500">@{user.username}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-zinc-500">TG ID</span>
            <p className="text-zinc-300">{user.telegramId}</p>
          </div>
          <div>
            <span className="text-zinc-500">Premium</span>
            <p className={user.isPremium ? 'text-green-500' : 'text-zinc-500'}>
              {user.isPremium ? 'Да' : 'Нет'}
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Trial кредиты</span>
            <p className="text-zinc-300">{user.trialCredits}</p>
          </div>
          <div>
            <span className="text-zinc-500">Регистрация</span>
            <p className="text-zinc-300">{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-1 min-w-max">
          {sectionTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSection(tab.key)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                activeSection === tab.key
                  ? 'bg-amber-500/15 text-amber-500'
                  : 'text-zinc-400 active:text-zinc-200'
              )}
            >
              {tab.label}
              <span className="ml-1 text-xs opacity-60">
                {tab.key === 'calculations' && user.calculations.length}
                {tab.key === 'yoo' && user.yooPayments.length}
                {tab.key === 'subs' && user.subscriptions.length}
                {tab.key === 'logs' && user.recentUsageLogs.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'calculations' && (
        <CalculationsSection data={user.calculations} />
      )}
      {activeSection === 'yoo' && (
        <YooPaymentsSection data={user.yooPayments} />
      )}
      {activeSection === 'subs' && (
        <SubscriptionsSection data={user.subscriptions} />
      )}
      {activeSection === 'logs' && (
        <UsageLogsSection data={user.recentUsageLogs} />
      )}
    </div>
  )
}

function CalculationsSection({ data }: { data: Calculation[] }) {
  if (data.length === 0) return <EmptyState />
  return (
    <div className="space-y-2">
      {data.map((calc) => (
        <div key={calc.id} className="bg-zinc-900 rounded-xl p-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm text-zinc-200 truncate">
              {calc.brandName} {calc.modelName} {calc.generationName}
            </p>
            <p className="text-xs text-zinc-500">{formatDate(calc.createdAt)}</p>
          </div>
          <p className="text-sm font-semibold text-amber-500 shrink-0 ml-3">
            {calc.totalPrice.toLocaleString('ru-RU')} &#8381;
          </p>
        </div>
      ))}
    </div>
  )
}

function YooPaymentsSection({ data }: { data: YooPayment[] }) {
  if (data.length === 0) return <EmptyState />
  return (
    <div className="space-y-2">
      {data.map((p) => (
        <div key={p.id} className="bg-zinc-900 rounded-xl p-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm text-zinc-200">{formatMoney(p.amount)}</p>
            <p className="text-xs text-zinc-500">
              {formatDate(p.createdAt)} &middot; {p.status}
              {p.isRecurring && ' \u00b7 recurring'}
            </p>
          </div>
          <StatusBadge status={p.status} />
        </div>
      ))}
    </div>
  )
}

function SubscriptionsSection({ data }: { data: Subscription[] }) {
  if (data.length === 0) return <EmptyState />
  return (
    <div className="space-y-2">
      {data.map((s) => (
        <div key={s.id} className="bg-zinc-900 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-200 font-medium">{s.plan}</p>
            <StatusBadge status={s.status} />
          </div>
          <p className="text-xs text-zinc-500">
            {s.credits}/{s.creditsTotal} кредитов &middot;{' '}
            {formatDate(s.currentPeriodStart)} — {formatDate(s.currentPeriodEnd)}
          </p>
          {s.cancelAtPeriodEnd && (
            <p className="text-xs text-red-500">Отменена в конце периода</p>
          )}
        </div>
      ))}
    </div>
  )
}

function UsageLogsSection({ data }: { data: UsageLog[] }) {
  if (data.length === 0) return <EmptyState />
  return (
    <div className="space-y-2">
      {data.map((log) => (
        <div key={log.id} className="bg-zinc-900 rounded-xl p-3 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-200 font-medium">{log.action}</p>
            <span className="text-xs text-zinc-500 shrink-0 ml-3">{formatDate(log.createdAt)}</span>
          </div>
          {log.metadata && (
            <pre className="text-xs text-zinc-500 overflow-x-auto whitespace-pre-wrap break-all">
              {log.metadata}
            </pre>
          )}
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    succeeded: 'bg-green-500/15 text-green-500',
    active: 'bg-green-500/15 text-green-500',
    pending: 'bg-amber-500/15 text-amber-500',
    past_due: 'bg-red-500/15 text-red-500',
    canceled: 'bg-zinc-700/50 text-zinc-400',
    expired: 'bg-zinc-700/50 text-zinc-400',
  }
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-md text-xs font-medium',
        colors[status] ?? 'bg-zinc-800 text-zinc-400'
      )}
    >
      {status}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center py-8">
      <p className="text-zinc-500 text-sm">Нет данных</p>
    </div>
  )
}
