import type { Price } from '@prisma/client'
import type { PriceData } from '../schema/types/price'

/**
 * Агрегирует цены из разных источников (drom, avito) в единую цену для каждой запчасти.
 *
 * Алгоритм:
 * - Один источник: используются данные as-is
 * - Несколько источников: weighted median по sampleSize, min/max по всем источникам
 * - URLs берутся из источника с наибольшим sampleSize
 */
export function aggregatePrices(prices: Price[]): Map<string, PriceData> {
  const grouped = new Map<string, Price[]>()

  for (const price of prices) {
    const existing = grouped.get(price.partId)
    if (existing) {
      existing.push(price)
    } else {
      grouped.set(price.partId, [price])
    }
  }

  const result = new Map<string, PriceData>()

  for (const [partId, sourcePrices] of grouped) {
    if (sourcePrices.length === 1) {
      const p = sourcePrices[0]
      result.set(partId, {
        median: p.median,
        min: p.minPrice,
        max: p.maxPrice,
        count: p.sampleSize,
        updatedAt: p.fetchedAt,
        minPriceUrl: p.minPriceUrl,
        maxPriceUrl: p.maxPriceUrl,
        medianPriceUrl: p.medianPriceUrl,
      })
      continue
    }

    let weightedSum = 0
    let totalSampleSize = 0
    let minPrice = Infinity
    let maxPrice = -Infinity
    let latestDate = new Date(0)
    let bestSource: Price = sourcePrices[0]

    for (const p of sourcePrices) {
      weightedSum += p.median * p.sampleSize
      totalSampleSize += p.sampleSize

      if (p.minPrice < minPrice) minPrice = p.minPrice
      if (p.maxPrice > maxPrice) maxPrice = p.maxPrice
      if (p.fetchedAt > latestDate) latestDate = p.fetchedAt
      if (p.sampleSize > bestSource.sampleSize) bestSource = p
    }

    const weightedMedian = totalSampleSize > 0
      ? Math.round(weightedSum / totalSampleSize)
      : 0

    result.set(partId, {
      median: weightedMedian,
      min: minPrice,
      max: maxPrice,
      count: totalSampleSize,
      updatedAt: latestDate,
      minPriceUrl: bestSource.minPriceUrl,
      maxPriceUrl: bestSource.maxPriceUrl,
      medianPriceUrl: bestSource.medianPriceUrl,
    })
  }

  return result
}
