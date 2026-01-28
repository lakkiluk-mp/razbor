import type { PrismaClient } from '@razbor/db'
import type { CalculationResultData, CalculationPartData } from '../schema/types/calculation'
import type { PartWithPriceData } from '../schema/types/part'

interface CalculateInput {
  generationId: string
  damagedZones: string[]
  excludedParts: string[]
  prisma: PrismaClient
}

export async function calculate(input: CalculateInput): Promise<CalculationResultData> {
  const { generationId, damagedZones, excludedParts, prisma } = input

  const generation = await prisma.generation.findUnique({
    where: { id: generationId },
    select: { id: true },
  })

  if (!generation) {
    throw new Error('GENERATION_NOT_FOUND: Поколение не найдено')
  }

  const modelParts = await prisma.modelPart.findMany({
    where: {
      generationId,
      isDefault: true,
    },
    include: {
      part: {
        include: {
          schematicZone: true,
        },
      },
    },
  })

  const prices = await prisma.price.findMany({
    where: { generationId },
  })

  const priceMap = new Map(prices.map((p) => [p.partId, p]))

  const parts: CalculationPartData[] = []
  let totalPrice = 0

  for (const modelPart of modelParts) {
    const { part } = modelPart
    const priceRecord = priceMap.get(part.id)

    const isDamaged = part.schematicZone
      ? damagedZones.includes(part.schematicZone.code)
      : false

    const isExcluded = excludedParts.includes(part.id)

    const included = !isDamaged && !isExcluded

    const partPrice = included && priceRecord ? priceRecord.median : 0

    if (included) {
      totalPrice += partPrice
    }

    const partWithPrice: PartWithPriceData = {
      id: part.id,
      name: part.name,
      category: part.category,
      schematicZone: part.schematicZone,
      price: priceRecord
        ? {
            median: priceRecord.median,
            min: priceRecord.minPrice,
            max: priceRecord.maxPrice,
            count: priceRecord.sampleSize,
            updatedAt: priceRecord.fetchedAt,
          }
        : null,
    }

    parts.push({
      part: partWithPrice,
      included,
      isDamaged,
      price: partPrice,
    })
  }

  return {
    totalPrice,
    parts,
  }
}

export const calculatorService = { calculate }
