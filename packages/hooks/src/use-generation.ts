import { useQuery } from '@tanstack/react-query'
import { queries } from '@razbor/graphql-client'

export interface SchematicZone {
  id: string
  code: string
  name: string
  type: string
}

export interface PriceSource {
  source: string
  min: number
  max: number
  minPriceUrl?: string | null
  maxPriceUrl?: string | null
  searchUrl?: string | null
  sampleSize: number
}

export interface Price {
  median: number
  min: number
  max: number
  count: number
  minPriceUrl?: string | null
  maxPriceUrl?: string | null
  medianPriceUrl?: string | null
  sources?: PriceSource[] | null
}

export interface Part {
  id: string
  name: string
  category: string
  oemCode?: string | null
  schematicZone: SchematicZone | null
  price: Price | null
}

export interface ModelInfo {
  id: string
  name: string
  slug: string
  brand: {
    id: string
    name: string
    slug: string
  }
}

export interface GenerationWithParts {
  id: string
  name: string
  slug: string
  yearStart: number
  yearEnd: number | null
  bodyType: string
  model: ModelInfo
  parts: Part[]
}

export interface GenerationResponse {
  generation: GenerationWithParts | null
}

export function useGeneration(
  fetchFn: (query: string, variables?: unknown) => Promise<unknown>,
  brandSlug: string,
  modelSlug: string,
  generationSlug: string
) {
  return useQuery({
    queryKey: ['generation', brandSlug, modelSlug, generationSlug],
    queryFn: () =>
      fetchFn(queries.generation, {
        brandSlug,
        modelSlug,
        generationSlug,
      }) as Promise<GenerationResponse>,
    enabled: Boolean(brandSlug) && Boolean(modelSlug) && Boolean(generationSlug),
  })
}
