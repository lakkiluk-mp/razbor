import { notFound } from 'next/navigation'
import { fetchGraphQL, queries } from '@/lib/graphql-client'
import type { GenerationResponse, GenerationConfigs } from '@razbor/hooks'
import { ConfigClient } from './config-client'

export const dynamic = 'force-dynamic'

interface GenerationConfigsResponse {
  generationConfigs: GenerationConfigs
}

interface Props {
  params: Promise<{
    brandSlug: string
    modelSlug: string
    generationSlug: string
  }>
}

export default async function ConfigPage({ params }: Props) {
  const { brandSlug, modelSlug, generationSlug } = await params

  const generationData = await fetchGraphQL<GenerationResponse>(queries.generation, {
    brandSlug,
    modelSlug,
    generationSlug,
  })

  if (!generationData.generation) {
    notFound()
  }

  const { generation } = generationData

  const configsData = await fetchGraphQL<GenerationConfigsResponse>(
    queries.generationConfigs,
    { generationId: generation.id }
  ).catch(() => ({ generationConfigs: { engines: [], transmissions: [] } }))

  const { generationConfigs } = configsData

  const hasConfigs =
    generationConfigs.engines.length > 0 || generationConfigs.transmissions.length > 0

  if (!hasConfigs) {
    const { redirect } = await import('next/navigation')
    redirect(`/calculator/${generation.id}?brand=${brandSlug}&model=${modelSlug}`)
  }

  return (
    <ConfigClient
      generation={generation}
      configs={generationConfigs}
      brandSlug={brandSlug}
      modelSlug={modelSlug}
    />
  )
}
