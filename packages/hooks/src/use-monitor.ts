import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { queries, mutations } from '@razbor/graphql-client'

export interface MonitorSubscription {
  id: string
  label: string
  brandSlug: string
  modelSlug: string
  city: string | null
  priceMin: number | null
  priceMax: number | null
  yearMin: number | null
  yearMax: number | null
  mileageMax: number | null
  isActive: boolean
  notificationsSent: number
  lastNotifiedAt: string | null
  createdAt: string
  updatedAt?: string
}

export interface MonitorCity {
  name: string
  slug: string
}

export interface MonitorSubscriptionsResponse {
  monitorSubscriptions: MonitorSubscription[]
}

export interface MonitorSubscriptionResponse {
  monitorSubscription: MonitorSubscription | null
}

export interface MonitorCitiesResponse {
  monitorCities: MonitorCity[]
}

export interface CreateMonitorInput {
  label: string
  brandSlug: string
  modelSlug: string
  city?: string | null
  priceMin?: number | null
  priceMax?: number | null
  yearMin?: number | null
  yearMax?: number | null
  mileageMax?: number | null
}

export function useMonitorSubscriptions(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>
) {
  return useQuery({
    queryKey: ['monitorSubscriptions'],
    queryFn: () => fetchFn(queries.monitorSubscriptions) as Promise<MonitorSubscriptionsResponse>,
  })
}

export function useMonitorSubscription(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>,
  id: string
) {
  return useQuery({
    queryKey: ['monitorSubscription', id],
    queryFn: () =>
      fetchFn(queries.monitorSubscription, { id }) as Promise<MonitorSubscriptionResponse>,
    enabled: !!id,
  })
}

export function useMonitorCities(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>
) {
  return useQuery({
    queryKey: ['monitorCities'],
    queryFn: () => fetchFn(queries.monitorCities) as Promise<MonitorCitiesResponse>,
    staleTime: 24 * 60 * 60 * 1000,
  })
}

export function useCreateMonitorSubscription(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateMonitorInput) =>
      fetchFn(mutations.createMonitorSubscription, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitorSubscriptions'] })
    },
  })
}

export function useDeleteMonitorSubscription(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchFn(mutations.deleteMonitorSubscription, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitorSubscriptions'] })
    },
  })
}

export function usePauseMonitorSubscription(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      fetchFn(mutations.pauseMonitorSubscription, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monitorSubscriptions'] })
    },
  })
}
