import { CalculatorClient } from './calculator-client'
import { fetchGraphQL } from '@/lib/graphql'
import type { Generation } from '@/lib/types'
import { z } from 'zod'

const ParamsSchema = z.object({
  generationId: z.string().min(1).max(100),
})

interface GenerationByIdResponse {
  generation: Generation | null
}

interface Props {
  params: Promise<{ generationId: string }>
  searchParams: Promise<{ brand?: string; model?: string }>
}

export default async function CalculatorPage({ params, searchParams }: Props) {
  const rawParams = await params
  const parsedParams = ParamsSchema.safeParse(rawParams)

  if (!parsedParams.success) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Некорректный ID поколения</p>
      </div>
    )
  }

  const { generationId } = parsedParams.data
  const { brand: brandSlug, model: modelSlug } = await searchParams

  const generationQuery = `
    query GetGenerationById($id: ID!) {
      generation: node(id: $id) {
        ... on Generation {
          id
          name
          slug
          yearStart
          yearEnd
          bodyType
          model {
            id
            name
            slug
            brand {
              id
              name
              slug
            }
          }
          parts {
            id
            name
            category
            schematicZone {
              id
              code
              name
              type
            }
            price {
              median
              min
              max
              count
            }
          }
        }
      }
    }
  `

  let generation: Generation | null = null

  if (brandSlug && modelSlug) {
    const genSlugQuery = `
      query GetGenerationBySlug($brandSlug: String!, $modelSlug: String!, $generationId: String!) {
        generation(brandSlug: $brandSlug, modelSlug: $modelSlug, generationSlug: $generationId) {
          id
          name
          slug
          yearStart
          yearEnd
          bodyType
          model {
            id
            name
            slug
            brand {
              id
              name
              slug
            }
          }
          parts {
            id
            name
            category
            schematicZone {
              id
              code
              name
              type
            }
            price {
              median
              min
              max
              count
            }
          }
        }
      }
    `
    try {
      const data = await fetchGraphQL<GenerationByIdResponse>(genSlugQuery, {
        brandSlug,
        modelSlug,
        generationId,
      })
      generation = data.generation
    } catch {
      generation = null
    }
  }

  if (!generation) {
    try {
      const data = await fetchGraphQL<GenerationByIdResponse>(generationQuery, {
        id: generationId,
      })
      generation = data.generation
    } catch {
      generation = null
    }
  }

  if (!generation) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Поколение не найдено</p>
      </div>
    )
  }

  return <CalculatorClient generation={generation} />
}
