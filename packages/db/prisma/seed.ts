import { PrismaClient } from '@prisma/client'
import { schematicZones } from './seed/schematic-zones'
import { mazda6Seed } from './seed/mazda-6'
import { mercedesCClassSeed } from './seed/mercedes-c-class'
import type { ModelSeed } from './seed/types'

const prisma = new PrismaClient()

const modelSeeds: ModelSeed[] = [mazda6Seed, mercedesCClassSeed] as ModelSeed[]

async function seedModel(seedData: ModelSeed) {
  console.log(`\n--- Seeding ${seedData.brand.name} ${seedData.model.name} ---`)

  const brand = await prisma.brand.upsert({
    where: { slug: seedData.brand.slug },
    update: {},
    create: seedData.brand,
  })
  console.log(`Brand: ${brand.name}`)

  const model = await prisma.model.upsert({
    where: {
      brandId_slug: { brandId: brand.id, slug: seedData.model.slug }
    },
    update: {},
    create: { ...seedData.model, brandId: brand.id },
  })
  console.log(`Model: ${model.name}`)

  let totalGenerations = 0
  let totalParts = 0

  for (const genData of seedData.generations) {
    console.log(`Creating generation: ${genData.name}...`)

    const generation = await prisma.generation.upsert({
      where: {
        modelId_slug: { modelId: model.id, slug: genData.slug }
      },
      update: {},
      create: {
        name: genData.name,
        slug: genData.slug,
        yearStart: genData.yearStart,
        yearEnd: genData.yearEnd,
        bodyType: genData.bodyType as 'sedan' | 'hatchback' | 'wagon' | 'crossover',
        isActive: genData.isActive,
        modelId: model.id,
      },
    })
    totalGenerations++

    const parts = seedData.getPartsForGeneration(genData)

    for (const partData of parts) {
      let schematicZoneId = null
      if (partData.schematicZoneCode) {
        const zone = await prisma.schematicZone.findUnique({
          where: { code: partData.schematicZoneCode }
        })
        if (!zone) {
          console.warn(`Warning: SchematicZone not found for code "${partData.schematicZoneCode}" (part: ${partData.name})`)
        }
        schematicZoneId = zone?.id || null
      }

      const part = await prisma.part.upsert({
        where: { slug: partData.slug },
        update: {
          searchQueries: partData.searchQueries || [],
          configGroup: partData.configGroup ?? null,
        },
        create: {
          name: partData.name,
          slug: partData.slug,
          category: partData.category as 'body' | 'optics' | 'glass' | 'engine' | 'transmission' | 'suspension' | 'interior' | 'electrical' | 'cooling' | 'other',
          schematicZoneId,
          searchQueries: partData.searchQueries || [],
          configGroup: partData.configGroup ?? null,
        },
      })

      await prisma.modelPart.upsert({
        where: {
          generationId_partId: { generationId: generation.id, partId: part.id }
        },
        update: {},
        create: {
          generationId: generation.id,
          partId: part.id,
          isDefault: true,
        },
      })

      totalParts++
    }

    console.log(`Created generation: ${generation.name} with ${parts.length} parts`)
  }

  return { totalGenerations, totalParts }
}

async function main() {
  console.log('Seeding database...')

  console.log('Creating schematic zones...')
  for (const zone of schematicZones) {
    await prisma.schematicZone.upsert({
      where: { code: zone.code },
      update: {},
      create: zone,
    })
  }
  console.log(`Created ${schematicZones.length} schematic zones`)

  let totalGenerations = 0
  let totalParts = 0

  for (const seedData of modelSeeds) {
    const result = await seedModel(seedData)
    totalGenerations += result.totalGenerations
    totalParts += result.totalParts
  }

  console.log(`\nSeeding completed! Created ${totalGenerations} generations, ${totalParts} parts`)
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
