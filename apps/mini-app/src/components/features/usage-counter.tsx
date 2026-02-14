import { useQuery } from '@tanstack/react-query'
import { fetchGraphQL, queries } from '@/lib/graphql-client'

interface UsageInfoResponse {
  usageInfo: {
    freeRemaining: number
    freeResetAt: string
    dailyLimit: number
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

  const { freeRemaining, dailyLimit } = data.usageInfo

  return (
    <div className="px-4 pb-8">
      <div className="bg-zinc-900 rounded-xl px-4 py-3 text-center">
        <span className="text-zinc-400 text-sm">
          Осталось{' '}
          <span className="text-amber-500 font-semibold">{freeRemaining}</span>
          {' '}из {dailyLimit} бесплатных оценок
        </span>
      </div>
    </div>
  )
}
