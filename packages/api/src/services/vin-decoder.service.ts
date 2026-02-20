import type { PrismaClient } from '@razbor/db'
import { VIN_BRAND_MAPPINGS } from './vin-mappings'
import type { VinBrandMapping, VinModelMapping, VinGenCode, VinVariantConfig } from './vin-mappings'

const VIN_YEAR_CODES: Record<string, number> = {
  '1': 2001, '2': 2002, '3': 2003, '4': 2004, '5': 2005,
  '6': 2006, '7': 2007, '8': 2008, '9': 2009,
  A: 2010, B: 2011, C: 2012, D: 2013, E: 2014,
  F: 2015, G: 2016, H: 2017, J: 2018, K: 2019,
  L: 2020, M: 2021, N: 2022, P: 2023, R: 2024,
  S: 2025, T: 2026, V: 2027, W: 2028, X: 2029, Y: 2030,
}

export interface VinDecodeResult {
  success: boolean
  vin: string
  year: number | null
  brand: { slug: string; name: string } | null
  model: { slug: string; name: string } | null
  generation: { id: string; slug: string; name: string; bodyType: string } | null
  suggestedConfigs: {
    engines: string[]
    transmissions: string[]
    drivetrains: string[]
  }
  availableGenerations: Array<{ id: string; slug: string; name: string }>
  needsSelection: {
    generation: boolean
    engine: boolean
    transmission: boolean
    drivetrain: boolean
  }
  error: string | null
}


// Fallback WMI → brandSlug для брендов без детального маппинга
const WMI_TO_BRAND: Record<string, string> = {}
for (const bm of VIN_BRAND_MAPPINGS) {
  for (const wmi of bm.wmi) {
    WMI_TO_BRAND[wmi] = bm.brandSlug
  }
}

// ---------------------------------------------------------------------------
// VIN PARSING
// ---------------------------------------------------------------------------

function parseVinYear(vin: string, position = 9): number | null {
  const code = vin[position]?.toUpperCase()
  return code ? VIN_YEAR_CODES[code] ?? null : null
}

function parseWmi(vin: string): string {
  return vin.substring(0, 3).toUpperCase()
}

function findBrandMappings(wmi: string): VinBrandMapping[] {
  return VIN_BRAND_MAPPINGS.filter(bm => bm.wmi.includes(wmi))
}

function matchModelCodes(vin: string, model: VinModelMapping): boolean {
  if (!model.modelCodes) return true
  const [start, end] = model.modelCodes.position
  const code = vin.substring(start, end).toUpperCase()
  return model.modelCodes.codes.some(c => code.startsWith(c))
}

function extractGenCode(vin: string, model: VinModelMapping): VinGenCode | null {
  if (!model.generationCodes) return null
  const [start, end] = model.generationCodes.position
  const code = vin.substring(start, end).toUpperCase()
  return model.generationCodes.mapping[code] ?? null
}

function extractEngines(vin: string, model: VinModelMapping): string[] {
  if (model.engineCodes) {
    const code = vin[model.engineCodes.position]?.toUpperCase()
    if (code) return model.engineCodes.mapping[code] ?? []
  }
  if (model.engineCodesRange) {
    const [start, end] = model.engineCodesRange.position
    const code = vin.substring(start, end).toUpperCase()
    return model.engineCodesRange.mapping[code] ?? []
  }
  return []
}

function extractTransmissions(vin: string, model: VinModelMapping): string[] {
  if (!model.transmissionCodes) return []
  const code = vin[model.transmissionCodes.position]?.toUpperCase()
  if (!code) return []
  return model.transmissionCodes.mapping[code] ?? []
}

function extractVariant(vin: string, model: VinModelMapping): VinVariantConfig | null {
  if (!model.variantCodes) return null
  const [start, end] = model.variantCodes.position
  const code = vin.substring(start, end).toUpperCase()
  return model.variantCodes.mapping[code] ?? null
}

function filterByAvailable(suggested: string[], available: string[]): string[] {
  if (suggested.length === 0) return []
  const set = new Set(available)
  const filtered = suggested.filter(s => set.has(s))
  return filtered.length > 0 ? filtered : suggested
}

// ---------------------------------------------------------------------------
// NHTSA (BMW бонус)
// ---------------------------------------------------------------------------

async function fetchNhtsa(vin: string): Promise<{ enginePower?: string } | null> {
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`
    )
    if (!res.ok) return null
    const data = await res.json() as {
      Results: Array<{ VariableId: number; Value: string | null }>
    }
    const power = data.Results.find(r => r.VariableId === 71)?.Value || undefined
    return { enginePower: power }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// MAIN DECODER
// ---------------------------------------------------------------------------

async function getAvailableConfigs(generationId: string, prisma: PrismaClient): Promise<string[]> {
  const parts = await prisma.modelPart.findMany({
    where: { generationId },
    include: { part: { select: { configGroup: true } } },
  })
  return [...new Set(parts.map(p => p.part.configGroup).filter(Boolean) as string[])]
}

export async function decodeVin(
  vin: string,
  prisma: PrismaClient
): Promise<VinDecodeResult> {
  const cleanVin = vin.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

  const result: VinDecodeResult = {
    success: false,
    vin: cleanVin,
    year: null,
    brand: null,
    model: null,
    generation: null,
    suggestedConfigs: { engines: [], transmissions: [], drivetrains: [] },
    availableGenerations: [],
    needsSelection: { generation: false, engine: false, transmission: false, drivetrain: false },
    error: null,
  }

  if (cleanVin.length !== 17) {
    result.error = 'VIN должен содержать 17 символов'
    return result
  }

  const wmi = parseWmi(cleanVin)

  // 1. Ищем brand по WMI
  const brandMappings = findBrandMappings(wmi)
  if (brandMappings.some(bm => bm.skipYearParsing)) {
    result.year = null
  } else {
    const yearPos = brandMappings.find(bm => bm.yearPosition !== undefined)?.yearPosition ?? 9
    result.year = parseVinYear(cleanVin, yearPos)
  }
  const brandSlug = brandMappings[0]?.brandSlug ?? WMI_TO_BRAND[wmi]

  if (!brandSlug) {
    result.error = 'Производитель не найден в базе'
    return result
  }

  const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } })
  if (!brand) {
    result.error = 'Марка не найдена в каталоге'
    return result
  }
  result.brand = { slug: brand.slug, name: brand.name }

  // 2. Пробуем найти конкретную модель через маппинги
  let matchedModel: VinModelMapping | null = null
  let matchedBrandMapping: VinBrandMapping | null = null

  for (const bm of brandMappings) {
    for (const model of bm.models) {
      if (matchModelCodes(cleanVin, model)) {
        matchedModel = model
        matchedBrandMapping = bm
        break
      }
    }
    if (matchedModel) break
  }

  // Для XW8 (VW Group Rus) — пробуем и VW и Skoda
  if (!matchedModel && wmi === 'XW8') {
    const allXw8 = VIN_BRAND_MAPPINGS.filter(bm =>
      bm.brandSlug === 'volkswagen' || bm.brandSlug === 'skoda'
    )
    for (const bm of allXw8) {
      for (const model of bm.models) {
        if (matchModelCodes(cleanVin, model)) {
          matchedModel = model
          matchedBrandMapping = bm
          const altBrand = await prisma.brand.findUnique({ where: { slug: bm.brandSlug } })
          if (altBrand) {
            result.brand = { slug: altBrand.slug, name: altBrand.name }
          }
          break
        }
      }
      if (matchedModel) break
    }
  }

  // Если модель нашлась в маппинге другого бренда (например Kia vs Hyundai на Z94) — обновляем brand
  if (matchedBrandMapping && matchedBrandMapping.brandSlug !== result.brand?.slug) {
    const altBrand = await prisma.brand.findUnique({ where: { slug: matchedBrandMapping.brandSlug } })
    if (altBrand) {
      result.brand = { slug: altBrand.slug, name: altBrand.name }
    }
  }

  // 3. Если нет маппинга — fallback: определяем модель по БД
  if (!matchedModel) {
    return fallbackDecode(cleanVin, result, prisma)
  }

  // 4. Находим модель в БД
  const dbModel = await prisma.model.findFirst({
    where: { slug: matchedModel.modelSlug, brand: { slug: result.brand.slug } },
    select: { id: true, slug: true, name: true },
  })

  if (!dbModel) {
    return fallbackDecode(cleanVin, result, prisma)
  }
  result.model = { slug: dbModel.slug, name: dbModel.name }

  // 5. Определяем поколение
  const genCode = extractGenCode(cleanVin, matchedModel)

  const allGenerations = await prisma.generation.findMany({
    where: { modelId: dbModel.id, isActive: true },
    select: { id: true, slug: true, name: true, yearStart: true, yearEnd: true, bodyType: true },
    orderBy: { yearStart: 'desc' },
  })

  let matchedGeneration = genCode
    ? allGenerations.find(g => g.slug === genCode.slug)
    : null

  if (!matchedGeneration && result.year) {
    const byYear = allGenerations.filter(g =>
      g.yearStart <= result.year! && (!g.yearEnd || g.yearEnd >= result.year!)
    )
    if (byYear.length === 1) {
      matchedGeneration = byYear[0]
    } else if (byYear.length > 1) {
      result.availableGenerations = byYear
      result.needsSelection.generation = true
    }
  }

  if (!matchedGeneration && !result.needsSelection.generation) {
    if (allGenerations.length === 1) {
      matchedGeneration = allGenerations[0]
    } else {
      result.availableGenerations = allGenerations
      result.needsSelection.generation = true
    }
  }

  // 6. Заполняем конфиги
  if (matchedGeneration) {
    result.generation = {
      id: matchedGeneration.id,
      slug: matchedGeneration.slug,
      name: matchedGeneration.name,
      bodyType: genCode?.bodyType ?? matchedGeneration.bodyType,
    }

    const availableConfigs = await getAvailableConfigs(matchedGeneration.id, prisma)

    const variant = extractVariant(cleanVin, matchedModel)

    if (variant) {
      if (variant.engines) {
        result.suggestedConfigs.engines = filterByAvailable(variant.engines, availableConfigs)
      }
      if (variant.transmissions) {
        result.suggestedConfigs.transmissions = filterByAvailable(variant.transmissions, availableConfigs)
      }
      if (variant.drivetrains) {
        result.suggestedConfigs.drivetrains = filterByAvailable(variant.drivetrains, availableConfigs)
      }
    } else {
      const vinEngines = extractEngines(cleanVin, matchedModel)
      result.suggestedConfigs.engines = filterByAvailable(vinEngines, availableConfigs)

      const vinTransmissions = extractTransmissions(cleanVin, matchedModel)
      result.suggestedConfigs.transmissions = filterByAvailable(vinTransmissions, availableConfigs)
    }

    result.needsSelection.engine = result.suggestedConfigs.engines.length !== 1
    result.needsSelection.transmission = result.suggestedConfigs.transmissions.length !== 1
    result.needsSelection.drivetrain = result.suggestedConfigs.drivetrains.length !== 1

    const allTransmissions = availableConfigs.filter(c => c.startsWith('transmission:'))
    if (allTransmissions.length === 1 && result.suggestedConfigs.transmissions.length === 0) {
      result.suggestedConfigs.transmissions = allTransmissions
      result.needsSelection.transmission = false
    }

    const drivetrains = availableConfigs.filter(c => c.startsWith('drivetrain:'))
    if (drivetrains.length === 1 && result.suggestedConfigs.drivetrains.length === 0) {
      result.suggestedConfigs.drivetrains = drivetrains
      result.needsSelection.drivetrain = false
    }
  }

  result.success = true
  return result
}

async function fallbackDecode(
  vin: string,
  result: VinDecodeResult,
  prisma: PrismaClient
): Promise<VinDecodeResult> {
  if (!result.brand) {
    result.success = true
    return result
  }

  const models = await prisma.model.findMany({
    where: { brand: { slug: result.brand.slug } },
    select: { id: true, slug: true, name: true },
  })

  if (models.length === 1) {
    result.model = { slug: models[0].slug, name: models[0].name }
  }

  if (result.model) {
    const generations = await prisma.generation.findMany({
      where: {
        model: { slug: result.model.slug, brand: { slug: result.brand.slug } },
        isActive: true,
      },
      select: { id: true, slug: true, name: true, yearStart: true, yearEnd: true, bodyType: true },
      orderBy: { yearStart: 'desc' },
    })

    if (generations.length === 1) {
      const g = generations[0]
      result.generation = { id: g.id, slug: g.slug, name: g.name, bodyType: g.bodyType }
    } else if (result.year) {
      const byYear = generations.filter(g =>
        g.yearStart <= result.year! && (!g.yearEnd || g.yearEnd >= result.year!)
      )
      if (byYear.length === 1) {
        const g = byYear[0]
        result.generation = { id: g.id, slug: g.slug, name: g.name, bodyType: g.bodyType }
      } else {
        result.availableGenerations = byYear.length > 0 ? byYear : generations
        result.needsSelection.generation = true
      }
    } else {
      result.availableGenerations = generations
      result.needsSelection.generation = true
    }

    if (result.generation) {
      const availableConfigs = await getAvailableConfigs(result.generation.id, prisma)

      const drivetrains = availableConfigs.filter(c => c.startsWith('drivetrain:'))
      if (drivetrains.length === 1) {
        result.suggestedConfigs.drivetrains = drivetrains
        result.needsSelection.drivetrain = false
      } else {
        result.needsSelection.drivetrain = true
      }

      const transmissions = availableConfigs.filter(c => c.startsWith('transmission:'))
      if (transmissions.length === 1) {
        result.suggestedConfigs.transmissions = transmissions
        result.needsSelection.transmission = false
      } else {
        result.needsSelection.transmission = true
      }

      result.needsSelection.engine = true
    }
  }

  if (result.brand.slug === 'bmw') {
    const nhtsaData = await fetchNhtsa(vin)
    if (nhtsaData?.enginePower) {
      result.suggestedConfigs.engines = [`engine:nhtsa-${nhtsaData.enginePower}hp`]
    }
  }

  result.success = true
  result.needsSelection.engine = result.needsSelection.engine !== false
  result.needsSelection.transmission = result.needsSelection.transmission !== false
  result.needsSelection.drivetrain = result.needsSelection.drivetrain !== false
  return result
}
