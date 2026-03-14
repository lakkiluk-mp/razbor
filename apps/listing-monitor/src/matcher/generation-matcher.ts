import { type PrismaClient } from '@razbor/db'

export interface GenerationMatchResult {
  generationId: string
  generationName: string
  brandSlug: string
  modelSlug: string
}

export async function matchToGeneration(
  brandSlug: string,
  modelSlug: string,
  year: number | null,
  prisma: PrismaClient,
): Promise<GenerationMatchResult | null> {
  const brand = await prisma.brand.findUnique({
    where: { slug: brandSlug },
  })
  if (!brand) return null

  const model = await prisma.model.findUnique({
    where: { brandId_slug: { brandId: brand.id, slug: modelSlug } },
  })
  if (!model) return null

  const generations = await prisma.generation.findMany({
    where: { modelId: model.id, isActive: true },
  })
  if (generations.length === 0) return null

  let selected: (typeof generations)[number]

  if (year !== null) {
    const matching = generations.filter(
      (g) => g.yearStart <= year && (g.yearEnd === null || g.yearEnd >= year),
    )

    if (matching.length > 0) {
      selected = matching.reduce((best, g) =>
        g.yearStart > best.yearStart ? g : best,
      )
    } else {
      return null
    }
  } else {
    selected = generations.reduce((best, g) =>
      g.yearStart > best.yearStart ? g : best,
    )
  }

  return {
    generationId: selected.id,
    generationName: selected.name,
    brandSlug,
    modelSlug,
  }
}
