import { useQuery } from '@tanstack/react-query'
import { queries } from '@razbor/graphql-client'

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
}

export interface BrandsResponse {
  brands: Brand[]
}

export function useBrands(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>
) {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => fetchFn(queries.brands) as Promise<BrandsResponse>,
  })
}
