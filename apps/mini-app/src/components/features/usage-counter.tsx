import { useQuery } from '@tanstack/react-query'
import { Crown } from 'lucide-react'
import { fetchGraphQL, queries } from '@/lib/graphql-client'

interface UsageInfoResponse {
  usageInfo: {
    trialCredits: number
    subscriptionCredits: number
    totalCredits: number
    hasActiveSubscription: boolean
  }
}

export function useUsageInfo() {
  return useQuery({
    queryKey: ['usageInfo'],
    queryFn: () => fetchGraphQL<UsageInfoResponse>(queries.usageInfo),
    staleTime: 0,
  })
}

export function UsageCounter() {
  const { data, isLoading } = useUsageInfo()

  if (isLoading || !data) {
    return (
      <div className="px-4 pb-8">
        <div className="bg-zinc-900 rounded-xl px-4 py-3 text-center">
          <span className="text-zinc-400 text-sm">Загрузка...</span>
        </div>
      </div>
    )
  }

  const { totalCredits, hasActiveSubscription } = data.usageInfo

  return (
    <div className="px-4 pb-8">
      <div className="bg-zinc-900 rounded-xl px-4 py-3 text-center flex items-center justify-center gap-2">
        {hasActiveSubscription && (
          <Crown className="w-4 h-4 text-amber-500" />
        )}
        <span className="text-zinc-400 text-sm">
          Осталось расчётов:{' '}
          <span className="text-amber-500 font-semibold">{totalCredits}</span>
        </span>
      </div>
    </div>
  )
}
