import type { PrismaClient } from '@razbor/db'
import type { CalculationResultData, CalculationPartData } from '../schema/types/calculation'
import type { PartWithPriceData } from '../schema/types/part'
import { aggregatePrices } from '../utils/aggregate-prices'

interface CalculateInput {
  generationId: string
  damagedZones: string[]
  excludedParts: string[]
  selectedEngine: string | null
  selectedTransmission: string | null
  selectedDrivetrain: string | null
  prisma: PrismaClient
}

export async function calculate(input: CalculateInput): Promise<CalculationResultData> {
  const { generationId, damagedZones, excludedParts, selectedEngine, selectedTransmission, selectedDrivetrain, prisma } = input

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

  const sharedPartIds = modelParts.filter((mp) => mp.part.isShared).map((mp) => mp.partId)
  const regularPartIds = modelParts.filter((mp) => !mp.part.isShared).map((mp) => mp.partId)

  const [regularPrices, sharedPrices] = await Promise.all([
    regularPartIds.length > 0
      ? prisma.price.findMany({ where: { generationId, partId: { in: regularPartIds } } })
      : Promise.resolve([]),
    sharedPartIds.length > 0
      ? prisma.price.findMany({ where: { partId: { in: sharedPartIds }, generationId: null } })
      : Promise.resolve([]),
  ])

  const regularPriceMap = aggregatePrices(regularPrices)
  const sharedPriceMap = aggregatePrices(sharedPrices)

  const parts: CalculationPartData[] = []
  let totalPrice = 0

  for (const modelPart of modelParts) {
    const { part } = modelPart
    const priceMapForPart = part.isShared ? sharedPriceMap : regularPriceMap
    const aggregated = priceMapForPart.get(part.id)

    const isConfigPart = part.configGroup !== null

    if (isConfigPart) {
      const isEngine = part.configGroup?.startsWith('engine:')
      const isTransmission = part.configGroup?.startsWith('transmission:')
      const isDrivetrain = part.configGroup?.startsWith('drivetrain:')

      let isConfigSelected = false
      if (isEngine) {
        isConfigSelected = part.configGroup === selectedEngine
      } else if (isTransmission) {
        isConfigSelected = part.configGroup === selectedTransmission
      } else if (isDrivetrain) {
        isConfigSelected = part.configGroup === selectedDrivetrain
      }

      if (!isConfigSelected) {
        continue
      }
    }

    const isDamaged = part.schematicZone
      ? damagedZones.includes(part.schematicZone.code)
      : false

    const isExcluded = excludedParts.includes(part.id)

    const included = !isDamaged && !isExcluded

    const partPrice = included && aggregated ? aggregated.median : 0

    if (included) {
      totalPrice += partPrice
    }

    const partWithPrice: PartWithPriceData = {
      id: part.id,
      name: part.name,
      category: part.category,
      schematicZone: part.schematicZone,
      configGroup: part.configGroup,
      isShared: part.isShared,
      price: aggregated ?? null,
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
