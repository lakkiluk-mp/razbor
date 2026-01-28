import { useQuery } from '@tanstack/react-query'
import { queries } from '@razbor/graphql-client'

export interface BrandInfo {
  id: string
  name: string
  slug: string
}

export interface Generation {
  id: string
  name: string
  slug: string
  yearStart: number
  yearEnd: number | null
  bodyType: string
}

export interface ModelWithGenerations {
  id: string
  name: string
  slug: string
  brand: BrandInfo
  generations: Generation[]
}

export interface ModelResponse {
  model: ModelWithGenerations | null
}

export function useModel(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>,
  brandSlug: string,
  modelSlug: string
) {
  return useQuery({
    queryKey: ['model', brandSlug, modelSlug],
    queryFn: () =>
      fetchFn(queries.model, { brandSlug, modelSlug }) as Promise<ModelResponse>,
    enabled: Boolean(brandSlug) && Boolean(modelSlug),
  })
}
