import { useQuery } from '@tanstack/react-query'
import { queries } from '@razbor/graphql-client'

export interface Model {
  id: string
  name: string
  slug: string
}

export interface BrandWithModels {
  id: string
  name: string
  slug: string
  logo: string | null
  models: Model[]
}

export interface BrandResponse {
  brand: BrandWithModels | null
}

export function useBrand(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>,
  slug: string
) {
  return useQuery({
    queryKey: ['brand', slug],
    queryFn: () => fetchFn(queries.brand, { slug }) as Promise<BrandResponse>,
    enabled: Boolean(slug),
  })
}
