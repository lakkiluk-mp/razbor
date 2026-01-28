import { PrismaClient } from '@prisma/client'
import { schematicZones } from './seed/schematic-zones'
import { ladaVestaSeed } from './seed/lada-vesta'

const prisma = new PrismaClient()

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

  console.log('Creating brand...')
  const brand = await prisma.brand.upsert({
    where: { slug: ladaVestaSeed.brand.slug },
    update: {},
    create: ladaVestaSeed.brand,
  })
  console.log(`Created brand: ${brand.name}`)

  console.log('Creating model...')
  const model = await prisma.model.upsert({
    where: {
      brandId_slug: { brandId: brand.id, slug: ladaVestaSeed.model.slug }
    },
    update: {},
    create: { ...ladaVestaSeed.model, brandId: brand.id },
  })
  console.log(`Created model: ${model.name}`)

  let totalGenerations = 0
  let totalParts = 0

  for (const genData of ladaVestaSeed.generations) {
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
        bodyType: genData.bodyType,
        isActive: genData.isActive,
        modelId: model.id,
      },
    })
    totalGenerations++

    const parts = ladaVestaSeed.getPartsForGeneration(genData)

    for (const partData of parts) {
      let schematicZoneId = null
      if (partData.schematicZoneCode) {
        const zone = await prisma.schematicZone.findUnique({
          where: { code: partData.schematicZoneCode }
        })
        schematicZoneId = zone?.id || null
      }

      const part = await prisma.part.upsert({
        where: { slug: partData.slug },
        update: {},
        create: {
          name: partData.name,
          slug: partData.slug,
          category: partData.category,
          schematicZoneId,
          searchQueries: partData.searchQueries || [],
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

      await prisma.price.upsert({
        where: {
          partId_generationId: { partId: part.id, generationId: generation.id }
        },
        update: partData.price,
        create: {
          partId: part.id,
          generationId: generation.id,
          ...partData.price,
          source: 'seed',
          fetchedAt: new Date(),
        },
      })

      totalParts++
    }

    console.log(`Created generation: ${generation.name} with ${parts.length} parts`)
  }

  console.log(`Seeding completed! Created ${totalGenerations} generations, ${totalParts} parts with prices`)
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
