import type { PrismaClient } from '@razbor/db'
import { createLogger } from '../logger/index.js'

const logger = createLogger('listings-storage')

interface EnrichedListingCard {
  extId: string
  regionSlug: string
  title: string
  brand: string
  model: string
  engineVolume: string
  transmission: string
  price: number
  year: number | null
  url: string
  city: string
  imageUrl: string
  publishedAt: Date
  sellerType: string
  mileage: number | null
  isDamaged: boolean
  generationId: string | null
  configGroups: string
  estimateMin: number | null
  estimateMax: number | null
  estimateAvg: number | null
  estimateExact: boolean
  profit: number | null
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

export async function saveListings(
  regionSlug: string,
  cards: EnrichedListingCard[],
  prisma: PrismaClient,
): Promise<number> {
  if (cards.length === 0) return 0

  const batches = chunk(cards, 50)
  const now = new Date()
  let total = 0

  for (const batch of batches) {
    try {
      const ops = batch.map((card) =>
        prisma.monitorListing.upsert({
          where: {
            extId_regionSlug: {
              extId: card.extId,
              regionSlug: card.regionSlug,
            },
          },
          create: {
            extId: card.extId,
            regionSlug: card.regionSlug,
            title: card.title,
            brand: card.brand,
            model: card.model,
            engineVolume: card.engineVolume,
            transmission: card.transmission,
            price: card.price,
            year: card.year,
            url: card.url,
            city: card.city,
            imageUrl: card.imageUrl,
            publishedAt: card.publishedAt,
            sellerType: card.sellerType,
            mileage: card.mileage,
            isDamaged: card.isDamaged,
            generationId: card.generationId,
            configGroups: card.configGroups,
            estimateMin: card.estimateMin,
            estimateMax: card.estimateMax,
            estimateAvg: card.estimateAvg,
            estimateExact: card.estimateExact,
            profit: card.profit,
            isActive: true,
            lastSeenAt: now,
          },
          update: {
            price: card.price,
            profit: card.profit,
            estimateMin: card.estimateMin,
            estimateMax: card.estimateMax,
            estimateAvg: card.estimateAvg,
            estimateExact: card.estimateExact,
            configGroups: card.configGroups,
            isDamaged: card.isDamaged,
            lastSeenAt: now,
            isActive: true,
          },
        }),
      )

      await prisma.$transaction(ops)
      total += batch.length
    } catch (error) {
      logger.error(
        { region: regionSlug, batchSize: batch.length, error },
        'Failed to save listing batch, continuing',
      )
    }
  }

  logger.info({ region: regionSlug, count: total }, 'Listings saved')
  return total
}

export async function deleteRegionListings(
  regionSlug: string,
  prisma: PrismaClient,
): Promise<number> {
  try {
    const result = await prisma.monitorListing.deleteMany({
      where: { regionSlug },
    })

    logger.info({ region: regionSlug, count: result.count }, 'Region listings deleted before refresh')
    return result.count
  } catch (error) {
    logger.error({ region: regionSlug, error }, 'Failed to delete region listings')
    return 0
  }
}
