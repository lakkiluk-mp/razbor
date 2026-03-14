import type { PrismaClient, Price, ModelPart, Part } from '@razbor/db'
import { findMatchingConfigs } from './config-matcher'

export interface EstimateResult {
  estimateMin: number | null
  estimateMax: number | null
  estimateAvg: number | null
  estimateExact: boolean
  profit: number | null
  configGroups: string
}

type ModelPartWithPart = ModelPart & { part: Part }

function aggregatePricesMap(prices: Price[]): Map<string, number> {
  const grouped = new Map<string, Price[]>()

  for (const price of prices) {
    const existing = grouped.get(price.partId)
    if (existing) {
      existing.push(price)
    } else {
      grouped.set(price.partId, [price])
    }
  }

  const result = new Map<string, number>()

  for (const [partId, sourcePrices] of grouped) {
    if (sourcePrices.length === 0) continue

    if (sourcePrices.length === 1) {
      result.set(partId, sourcePrices[0].median)
      continue
    }

    let weightedSum = 0
    let totalSampleSize = 0

    for (const p of sourcePrices) {
      weightedSum += p.median * p.sampleSize
      totalSampleSize += p.sampleSize
    }

    const weightedAvg =
      totalSampleSize > 0 ? Math.round(weightedSum / totalSampleSize) : 0

    result.set(partId, weightedAvg)
  }

  return result
}

function calculateTotalPrice(
  modelParts: ModelPartWithPart[],
  regularPriceMap: Map<string, number>,
  sharedPriceMap: Map<string, number>,
  selectedEngine: string,
  selectedTransmission: string,
  selectedDrivetrain: string | null,
): number | null {
  let totalPrice = 0
  let hasPrices = false

  for (const mp of modelParts) {
    const { part } = mp
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

    const priceMap = part.isShared ? sharedPriceMap : regularPriceMap
    const median = priceMap.get(part.id)

    if (median !== undefined) {
      totalPrice += median
      hasPrices = true
    }
  }

  return hasPrices ? totalPrice : null
}

const NULL_RESULT: EstimateResult = {
  estimateMin: null,
  estimateMax: null,
  estimateAvg: null,
  estimateExact: false,
  profit: null,
  configGroups: '',
}

export async function estimateDismantling(
  params: {
    generationId: string
    engineVolume: string | null
    transmission: string | null
    price: number
  },
  prisma: PrismaClient,
): Promise<EstimateResult> {
  const { generationId, engineVolume, transmission, price } = params

  const config = await findMatchingConfigs(
    generationId,
    engineVolume,
    transmission,
    prisma,
  )

  if (config.engines.length === 0) {
    return NULL_RESULT
  }

  const modelParts = await prisma.modelPart.findMany({
    where: {
      generationId,
      isDefault: true,
    },
    include: {
      part: true,
    },
  })

  if (modelParts.length === 0) {
    return NULL_RESULT
  }

  const transmissions =
    config.transmissions.length > 0
      ? config.transmissions
      : extractTransmissions(modelParts)

  if (transmissions.length === 0) {
    return NULL_RESULT
  }

  const drivetrains =
    config.drivetrains.length > 0
      ? config.drivetrains
      : extractDrivetrains(modelParts)

  const drivetrainVariants: (string | null)[] =
    drivetrains.length > 0 ? drivetrains : [null]

  const sharedPartIds: string[] = []
  const regularPartIds: string[] = []

  for (const mp of modelParts) {
    if (mp.part.isShared) {
      sharedPartIds.push(mp.partId)
    } else {
      regularPartIds.push(mp.partId)
    }
  }

  const [regularPrices, sharedPrices] = await Promise.all([
    regularPartIds.length > 0
      ? prisma.price.findMany({
          where: { generationId, partId: { in: regularPartIds } },
        })
      : Promise.resolve([]),
    sharedPartIds.length > 0
      ? prisma.price.findMany({
          where: { partId: { in: sharedPartIds }, generationId: null },
        })
      : Promise.resolve([]),
  ])

  const regularPriceMap = aggregatePricesMap(regularPrices as Price[])
  const sharedPriceMap = aggregatePricesMap(sharedPrices as Price[])

  const totals: number[] = []
  const matchedConfigs: string[] = []

  for (const engine of config.engines) {
    for (const trans of transmissions) {
      for (const drive of drivetrainVariants) {
        const total = calculateTotalPrice(
          modelParts,
          regularPriceMap,
          sharedPriceMap,
          engine,
          trans,
          drive,
        )
        if (total !== null) {
          totals.push(total)
          const configLabel =
            drive !== null
              ? `${engine}|${trans}|${drive}`
              : `${engine}|${trans}`
          matchedConfigs.push(configLabel)
        }
      }
    }
  }

  if (totals.length === 0) {
    return {
      ...NULL_RESULT,
      configGroups: matchedConfigs.join(','),
    }
  }

  if (totals.length === 1) {
    const avg = totals[0]
    return {
      estimateMin: avg,
      estimateMax: avg,
      estimateAvg: avg,
      estimateExact: true,
      profit: avg - price,
      configGroups: matchedConfigs.join(','),
    }
  }

  const estimateMin = Math.min(...totals)
  const estimateMax = Math.max(...totals)
  const estimateAvg = Math.round(
    totals.reduce((sum, v) => sum + v, 0) / totals.length,
  )

  return {
    estimateMin,
    estimateMax,
    estimateAvg,
    estimateExact: false,
    profit: estimateAvg - price,
    configGroups: matchedConfigs.join(','),
  }
}

function extractTransmissions(modelParts: ModelPartWithPart[]): string[] {
  const result = new Set<string>()
  for (const mp of modelParts) {
    if (mp.part.configGroup?.startsWith('transmission:')) {
      result.add(mp.part.configGroup)
    }
  }
  return [...result]
}

function extractDrivetrains(modelParts: ModelPartWithPart[]): string[] {
  const result = new Set<string>()
  for (const mp of modelParts) {
    if (mp.part.configGroup?.startsWith('drivetrain:')) {
      result.add(mp.part.configGroup)
    }
  }
  return [...result]
}
