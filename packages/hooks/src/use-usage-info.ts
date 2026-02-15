import { useQuery } from '@tanstack/react-query'
import { queries } from '@razbor/graphql-client'

export interface UsageInfo {
  trialCredits: number
  subscriptionCredits: number
  totalCredits: number
  hasActiveSubscription: boolean
}

export interface UsageInfoResponse {
  usageInfo: UsageInfo
}

export function useUsageInfo(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>
) {
  return useQuery({
    queryKey: ['usageInfo'],
    queryFn: () => fetchFn(queries.usageInfo) as Promise<UsageInfoResponse>,
  })
}
