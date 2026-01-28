import { CalculatorClient } from './calculator-client'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import type { GenerationWithParts, GenerationResponse } from '@razbor/hooks'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const ParamsSchema = z.object({
  generationId: z.string().min(1).max(100),
})

interface GenerationByIdResponse {
  generation: GenerationWithParts | null
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

  let generation: GenerationWithParts | null = null

  if (brandSlug && modelSlug) {
    try {
      const data = await fetchGraphQL<GenerationResponse>(queries.generation, {
        brandSlug,
        modelSlug,
        generationSlug: generationId,
      })
      generation = data.generation
    } catch {
      generation = null
    }
  }

  if (!generation) {
    try {
      const data = await fetchGraphQL<GenerationByIdResponse>(queries.generationById, {
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
