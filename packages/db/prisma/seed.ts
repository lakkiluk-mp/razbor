import { PrismaClient } from '@prisma/client'
import { schematicZones } from './seed/schematic-zones'
import { ladaVestaSeed } from './seed/lada-vesta'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Создать зоны трафарета
  console.log('Creating schematic zones...')
  for (const zone of schematicZones) {
    await prisma.schematicZone.upsert({
      where: { code: zone.code },
      update: {},
      create: zone,
    })
  }
  console.log(`✓ Created ${schematicZones.length} schematic zones`)

  // 2. Создать бренд
  console.log('Creating brand...')
  const brand = await prisma.brand.upsert({
    where: { slug: ladaVestaSeed.brand.slug },
    update: {},
    create: ladaVestaSeed.brand,
  })
  console.log(`✓ Created brand: ${brand.name}`)

  // 3. Создать модель
  console.log('Creating model...')
  const model = await prisma.model.upsert({
    where: {
      brandId_slug: { brandId: brand.id, slug: ladaVestaSeed.model.slug }
    },
    update: {},
    create: { ...ladaVestaSeed.model, brandId: brand.id },
  })
  console.log(`✓ Created model: ${model.name}`)

  // 4. Создать поколение
  console.log('Creating generation...')
  const generation = await prisma.generation.upsert({
    where: {
      modelId_slug: { modelId: model.id, slug: ladaVestaSeed.generation.slug }
    },
    update: {},
    create: { ...ladaVestaSeed.generation, modelId: model.id },
  })
  console.log(`✓ Created generation: ${generation.name}`)

  // 5. Создать запчасти с ценами
  console.log('Creating parts and prices...')
  let partsCreated = 0

  for (const partData of ladaVestaSeed.parts) {
    // Найти зону трафарета если указана
    let schematicZoneId = null
    if (partData.schematicZoneCode) {
      const zone = await prisma.schematicZone.findUnique({
        where: { code: partData.schematicZoneCode }
      })
      schematicZoneId = zone?.id || null
    }

    // Создать запчасть
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

    // Создать связь с поколением
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

    // Создать цену
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

    partsCreated++
  }
  console.log(`✓ Created ${partsCreated} parts with prices`)

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
