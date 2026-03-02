import { PrismaClient } from '@prisma/client'
import { schematicZones } from './seed/schematic-zones'
import { mazda6Seed } from './seed/mazda-6'
import { mazda3Seed } from './seed/mazda-3'
import { mazdaCx5Seed } from './seed/mazda-cx5'
import { mercedesCClassSeed } from './seed/mercedes-c-class'
import { mercedesSClassSeed } from './seed/mercedes-s-class'
import { renaultLoganSeed } from './seed/renault-logan'
import { renaultDusterSeed } from './seed/renault-duster'
import { kiaRioSeed } from './seed/kia-rio'
import { kiaOptimaSeed } from './seed/kia-optima'
import { kiaSportageSeed } from './seed/kia-sportage'
import { kiaCeedSeed } from './seed/kia-ceed'
import { fordFocusSeed } from './seed/ford-focus'
import { fordMondeoSeed } from './seed/ford-mondeo'
import { hyundaiSolarisSeed } from './seed/hyundai-solaris'
import { hyundaiCretaSeed } from './seed/hyundai-creta'
import { ladaVestaSeed } from './seed/lada-vesta'
import { ladaGrantaSeed } from './seed/lada-granta'
import { ladaNivaSeed } from './seed/lada-niva'
import { skodaRapidSeed } from './seed/skoda-rapid'
import { skodaOctaviaSeed } from './seed/skoda-octavia'
import { volkswagenPoloSeed } from './seed/volkswagen-polo'
import { volkswagenPassatSeed } from './seed/volkswagen-passat'
import { toyotaCamrySeed } from './seed/toyota-camry'
import { toyotaCorollaSeed } from './seed/toyota-corolla'
import { nissanQashqaiSeed } from './seed/nissan-qashqai'
import { nissanXTrailSeed } from './seed/nissan-x-trail'
import { audiQ5Seed } from './seed/audi-q5'
import { audiA3Seed } from './seed/audi-a3'
import { audiA6Seed } from './seed/audi-a6'
import { bmw3SeriesSeed } from './seed/bmw-3-series'
import { bmw5SeriesSeed } from './seed/bmw-5-series'
import { porscheCayenneSeed } from './seed/porsche-cayenne'
import { opelAstraSeed } from './seed/opel-astra'
import { chevroletLacettiSeed } from './seed/chevrolet-lacetti'
import { chevroletCruzeSeed } from './seed/chevrolet-cruze'
import { chevroletLanosSeed } from './seed/chevrolet-lanos'
import { mitsubishiLancerSeed } from './seed/mitsubishi-lancer'
import { mitsubishiOutlanderSeed } from './seed/mitsubishi-outlander'
import { hondaAccordSeed } from './seed/honda-accord'
import { hondaCivicSeed } from './seed/honda-civic'
import { subaruForesterSeed } from './seed/subaru-forester'
import { subaruImprezaSeed } from './seed/subaru-impreza'
import { citroenC4Seed } from './seed/citroen-c4'
import { lexusRx300Seed } from './seed/lexus-rx300'
import { SHARED_PARTS_REGISTRY, generateSharedPartSlug } from './seed/shared-parts'
import type { ModelSeed } from './seed/types'
import { isSharedPartRef } from './seed/types'

const prisma = new PrismaClient()

const modelSeeds: ModelSeed[] = [mazda6Seed, mazda3Seed, mazdaCx5Seed, mercedesCClassSeed, mercedesSClassSeed, renaultLoganSeed, renaultDusterSeed, kiaRioSeed, kiaOptimaSeed, kiaSportageSeed, kiaCeedSeed, fordFocusSeed, fordMondeoSeed, hyundaiSolarisSeed, hyundaiCretaSeed, ladaVestaSeed, ladaGrantaSeed, ladaNivaSeed, skodaRapidSeed, skodaOctaviaSeed, volkswagenPoloSeed, volkswagenPassatSeed, toyotaCamrySeed, toyotaCorollaSeed, nissanQashqaiSeed, nissanXTrailSeed, audiQ5Seed, audiA3Seed, audiA6Seed, bmw3SeriesSeed, bmw5SeriesSeed, porscheCayenneSeed, opelAstraSeed, chevroletLacettiSeed, chevroletCruzeSeed, chevroletLanosSeed, mitsubishiLancerSeed, mitsubishiOutlanderSeed, hondaAccordSeed, hondaCivicSeed, subaruForesterSeed, subaruImprezaSeed, citroenC4Seed, lexusRx300Seed] as ModelSeed[]

async function seedSharedParts() {
  console.log('\n--- Seeding shared parts ---')
  let count = 0

  for (const def of SHARED_PARTS_REGISTRY) {
    const zoneCode = def.category === 'engine' ? 'engine' : 'transmission'
    const zone = await prisma.schematicZone.findUnique({
      where: { code: zoneCode },
    })

    await prisma.part.upsert({
      where: { oemCode: def.oemCode },
      update: {
        searchQueries: def.searchQueries,
        name: def.name,
      },
      create: {
        name: def.name,
        slug: generateSharedPartSlug(def),
        category: def.category,
        isShared: true,
        oemCode: def.oemCode,
        schematicZoneId: zone?.id || null,
        searchQueries: def.searchQueries,
        configGroup: null,
      },
    })
    count++
  }

  console.log(`Created ${count} shared parts`)
}

async function seedModel(seedData: ModelSeed) {
  console.log(`\n--- Seeding ${seedData.brand.name} ${seedData.model.name} ---`)

  const brand = await prisma.brand.upsert({
    where: { slug: seedData.brand.slug },
    update: {
      logo: seedData.brand.logo,
      sortOrder: seedData.brand.sortOrder,
    },
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
    const seededPartIds: number[] = []

    for (const partOrRef of parts) {
      if (isSharedPartRef(partOrRef)) {
        const sharedPart = await prisma.part.findUnique({
          where: { oemCode: partOrRef.oemCode },
        })
        if (!sharedPart) {
          console.warn(`Warning: Shared part not found for OEM "${partOrRef.oemCode}"`)
          continue
        }

        if (partOrRef.configGroup) {
          if (sharedPart.configGroup && sharedPart.configGroup !== partOrRef.configGroup) {
            console.warn(
              `WARNING: Shared part "${sharedPart.name}" (OEM: ${partOrRef.oemCode}) ` +
              `has conflicting configGroup: existing="${sharedPart.configGroup}", ` +
              `new="${partOrRef.configGroup}". Last write wins!`
            )
          }
          if (sharedPart.configGroup !== partOrRef.configGroup) {
            await prisma.part.update({
              where: { id: sharedPart.id },
              data: { configGroup: partOrRef.configGroup },
            })
          }
        }

        await prisma.modelPart.upsert({
          where: {
            generationId_partId: { generationId: generation.id, partId: sharedPart.id },
          },
          update: {},
          create: {
            generationId: generation.id,
            partId: sharedPart.id,
            isDefault: true,
          },
        })
        seededPartIds.push(sharedPart.id)
        totalParts++
      } else {
        let schematicZoneId = null
        if (partOrRef.schematicZoneCode) {
          const zone = await prisma.schematicZone.findUnique({
            where: { code: partOrRef.schematicZoneCode }
          })
          if (!zone) {
            console.warn(`Warning: SchematicZone not found for code "${partOrRef.schematicZoneCode}" (part: ${partOrRef.name})`)
          }
          schematicZoneId = zone?.id || null
        }

        const part = await prisma.part.upsert({
          where: { slug: partOrRef.slug },
          update: {
            name: partOrRef.name,
            category: partOrRef.category as 'body' | 'optics' | 'glass' | 'engine' | 'transmission' | 'suspension' | 'interior' | 'electrical' | 'cooling' | 'other',
            searchQueries: partOrRef.searchQueries || [],
            configGroup: partOrRef.configGroup ?? null,
          },
          create: {
            name: partOrRef.name,
            slug: partOrRef.slug,
            category: partOrRef.category as 'body' | 'optics' | 'glass' | 'engine' | 'transmission' | 'suspension' | 'interior' | 'electrical' | 'cooling' | 'other',
            schematicZoneId,
            searchQueries: partOrRef.searchQueries || [],
            configGroup: partOrRef.configGroup ?? null,
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
        seededPartIds.push(part.id)
        totalParts++
      }
    }

    const stale = await prisma.modelPart.deleteMany({
      where: {
        generationId: generation.id,
        partId: { notIn: seededPartIds },
      },
    })
    if (stale.count > 0) {
      console.log(`Cleaned up ${stale.count} stale ModelPart(s) for ${genData.name}`)
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

  await seedSharedParts()

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
