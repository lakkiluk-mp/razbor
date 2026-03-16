import { QueryClient } from '@tanstack/react-query'

let queryClient: QueryClient | undefined

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 30 * 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    })
  }
  return queryClient
}
