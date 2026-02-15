import { QueryClient } from '@tanstack/react-query'

let queryClient: QueryClient | undefined

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 30,
          refetchOnWindowFocus: true,
        },
      },
    })
  }
  return queryClient
}
