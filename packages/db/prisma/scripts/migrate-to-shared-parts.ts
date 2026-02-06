import { PrismaClient } from '@prisma/client'
import { SHARED_PARTS_REGISTRY } from '../seed/shared-parts'

const prisma = new PrismaClient()

async function migrate() {
  console.log('=== Migration: Convert model-specific parts to shared ===\n')

  let migratedParts = 0
  let migratedPrices = 0
  let deletedOldParts = 0

  for (const def of SHARED_PARTS_REGISTRY) {
    console.log(`--- Processing OEM: ${def.oemCode} (${def.name}) ---`)

    const sharedPart = await prisma.part.findFirst({
      where: { oemCode: def.oemCode },
    })

    if (!sharedPart) {
      console.log(`  SKIP: Shared part not found for OEM ${def.oemCode}`)
      continue
    }

    console.log(`  Shared part found: ${sharedPart.slug} (id: ${sharedPart.id})`)

    const oldParts = await prisma.part.findMany({
      where: {
        id: { not: sharedPart.id },
        searchQueries: { has: `oem:${def.oemCode}` },
      },
      include: {
        modelParts: true,
        prices: true,
      },
    })

    if (oldParts.length === 0) {
      console.log(`  SKIP: No old model-specific parts found`)
      continue
    }

    console.log(`  Found ${oldParts.length} old part(s) to migrate`)

    for (const oldPart of oldParts) {
      console.log(`  Migrating: ${oldPart.slug} (id: ${oldPart.id})`)

      for (const mp of oldPart.modelParts) {
        const existing = await prisma.modelPart.findUnique({
          where: {
            generationId_partId: {
              generationId: mp.generationId,
              partId: sharedPart.id,
            },
          },
        })

        if (existing) {
          console.log(`    ModelPart already exists for generation ${mp.generationId}, skipping`)
        } else {
          await prisma.modelPart.create({
            data: {
              generationId: mp.generationId,
              partId: sharedPart.id,
              isDefault: mp.isDefault,
            },
          })
          console.log(`    Migrated ModelPart for generation ${mp.generationId}`)
          migratedParts++
        }
      }

      const pricesBySource = new Map<string, (typeof oldPart.prices)[number]>()
      for (const price of oldPart.prices) {
        const existing = pricesBySource.get(price.source)
        if (!existing || price.sampleSize > existing.sampleSize) {
          pricesBySource.set(price.source, price)
        }
      }

      for (const [source, bestPrice] of pricesBySource) {
        const existingSharedPrice = await prisma.price.findFirst({
          where: {
            partId: sharedPart.id,
            generationId: null,
            source,
          },
        })

        if (existingSharedPrice) {
          if (bestPrice.sampleSize > existingSharedPrice.sampleSize) {
            await prisma.price.update({
              where: { id: existingSharedPrice.id },
              data: {
                minPrice: bestPrice.minPrice,
                maxPrice: bestPrice.maxPrice,
                median: bestPrice.median,
                avgPrice: bestPrice.avgPrice,
                sampleSize: bestPrice.sampleSize,
                minPriceUrl: bestPrice.minPriceUrl,
                maxPriceUrl: bestPrice.maxPriceUrl,
                medianPriceUrl: bestPrice.medianPriceUrl,
                searchUrl: bestPrice.searchUrl,
                fetchedAt: bestPrice.fetchedAt,
              },
            })
            console.log(`    Updated shared price (${source}): sampleSize ${existingSharedPrice.sampleSize} -> ${bestPrice.sampleSize}`)
            migratedPrices++
          } else {
            console.log(`    Shared price (${source}) already has better sampleSize (${existingSharedPrice.sampleSize} >= ${bestPrice.sampleSize}), skipping`)
          }
        } else {
          await prisma.price.create({
            data: {
              partId: sharedPart.id,
              generationId: null,
              source,
              minPrice: bestPrice.minPrice,
              maxPrice: bestPrice.maxPrice,
              median: bestPrice.median,
              avgPrice: bestPrice.avgPrice,
              sampleSize: bestPrice.sampleSize,
              minPriceUrl: bestPrice.minPriceUrl,
              maxPriceUrl: bestPrice.maxPriceUrl,
              medianPriceUrl: bestPrice.medianPriceUrl,
              searchUrl: bestPrice.searchUrl,
              fetchedAt: bestPrice.fetchedAt,
            },
          })
          console.log(`    Created shared price (${source}): median=${bestPrice.median}, sampleSize=${bestPrice.sampleSize}`)
          migratedPrices++
        }
      }

      await prisma.part.delete({
        where: { id: oldPart.id },
      })
      console.log(`    Deleted old part: ${oldPart.slug}`)
      deletedOldParts++
    }
  }

  console.log(`\n=== Migration complete ===`)
  console.log(`Migrated parts: ${migratedParts}`)
  console.log(`Migrated prices: ${migratedPrices}`)
  console.log(`Deleted old parts: ${deletedOldParts}`)
}

migrate()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
