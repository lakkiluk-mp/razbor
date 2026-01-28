import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n📊 Database Statistics:\n')

  const brandsCount = await prisma.brand.count()
  const modelsCount = await prisma.model.count()
  const generationsCount = await prisma.generation.count()
  const schematicZonesCount = await prisma.schematicZone.count()
  const partsCount = await prisma.part.count()
  const pricesCount = await prisma.price.count()
  const modelPartsCount = await prisma.modelPart.count()

  console.log(`brands:          ${brandsCount}`)
  console.log(`models:          ${modelsCount}`)
  console.log(`generations:     ${generationsCount}`)
  console.log(`schematic_zones: ${schematicZonesCount}`)
  console.log(`parts:           ${partsCount}`)
  console.log(`prices:          ${pricesCount}`)
  console.log(`model_parts:     ${modelPartsCount}`)

  console.log('\n📦 Details:\n')

  const brands = await prisma.brand.findMany({
    include: {
      models: {
        include: {
          generations: true
        }
      }
    }
  })

  for (const brand of brands) {
    console.log(`${brand.name} (${brand.slug})`)
    for (const model of brand.models) {
      console.log(`  └─ ${model.name} (${model.slug})`)
      for (const gen of model.generations) {
        console.log(`      └─ ${gen.name} - ${gen.bodyType}`)
      }
    }
  }

  const partsWithZones = await prisma.part.count({ where: { schematicZoneId: { not: null } } })
  console.log(`\n🗺️  Parts with schematic zones: ${partsWithZones}/${partsCount}`)

  const avgPrice = await prisma.price.aggregate({
    _avg: { median: true },
    _min: { median: true },
    _max: { median: true }
  })

  console.log(`\n💰 Price Statistics:`)
  console.log(`   Min:    ${avgPrice._min.median?.toLocaleString('ru-RU')} ₽`)
  console.log(`   Max:    ${avgPrice._max.median?.toLocaleString('ru-RU')} ₽`)
  console.log(`   Avg:    ${avgPrice._avg.median?.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} ₽`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
