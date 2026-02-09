import { PartCategory } from '@prisma/client'
import type { PartData, SharedPartRef } from './types'
import { findSharedPart } from './shared-parts'

function q(searchNames: string[], suffix: string): string[] {
  return searchNames.map((n) => `${suffix} ${n}`)
}

export function engine(
  prefix: string,
  searchNames: string[],
  config: string,
  code: string,
  hp: number,
  oemQueries?: string[],
): PartData | SharedPartRef {
  if (oemQueries && oemQueries.length > 0) {
    const sharedDef = findSharedPart(oemQueries[0])
    if (sharedDef) {
      return { type: 'shared', oemCode: oemQueries[0], configGroup: `engine:${config}` }
    }
  }
  const vol = config.replace(/-\d+\w*$/, '')
  const slugConfig = config.replace(/\./g, '-')
  const oem = oemQueries?.map((q) => `oem:${q}`) ?? []
  return {
    name: `Двигатель ${vol} ${code} (${hp} л.с.)`,
    slug: `${prefix}-engine-${slugConfig}`,
    category: 'engine' as PartCategory,
    schematicZoneCode: 'engine',
    searchQueries: [
      ...oem,
      ...searchNames.map((n) => `двигатель ${vol} ${code} ${n}`),
      ...searchNames.map((n) => `двигатель ${vol} ${n}`),
      ...searchNames.map((n) => `мотор ${vol} ${n}`),
      ...q(searchNames, 'двигатель'),
    ],
    configGroup: `engine:${config}`,
  }
}

export function transmission(
  prefix: string,
  searchNames: string[],
  config: string,
  name: string,
  oemQueries?: string[],
): PartData | SharedPartRef {
  if (oemQueries && oemQueries.length > 0) {
    const sharedDef = findSharedPart(oemQueries[0])
    if (sharedDef) {
      return { type: 'shared', oemCode: oemQueries[0], configGroup: `transmission:${config}` }
    }
  }
  const getTransmissionSearchType = (c: string): string => {
    if (c.startsWith('at')) return 'акпп'
    if (c.startsWith('amt')) return 'ркпп'
    return 'мкпп'
  }
  const specificType = getTransmissionSearchType(config)
  const oem = oemQueries?.map((q) => `oem:${q}`) ?? []
  return {
    name,
    slug: `${prefix}-transmission-${config}`,
    category: 'transmission' as PartCategory,
    schematicZoneCode: 'transmission',
    searchQueries: [
      ...oem,
      ...q(searchNames, specificType),
      ...q(searchNames, 'коробка'),
    ],
    configGroup: `transmission:${config}`,
  }
}

export function drivetrainFWD(
  prefix: string,
  searchNames: string[],
): PartData[] {
  const base = {
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    configGroup: 'drivetrain:fwd',
  }
  return [
    {
      ...base,
      name: 'Привод левый (ШРУС)',
      slug: `${prefix}-driveshaft-l`,
      searchQueries: q(searchNames, 'привод левый'),
    },
    {
      ...base,
      name: 'Привод правый (ШРУС)',
      slug: `${prefix}-driveshaft-r`,
      searchQueries: q(searchNames, 'привод правый'),
    },
  ]
}

export function drivetrainRWD(
  prefix: string,
  searchNames: string[],
): PartData[] {
  return [
    {
      name: 'Кардан',
      slug: `${prefix}-driveshaft-rwd`,
      category: 'suspension' as PartCategory,
      schematicZoneCode: null,
      searchQueries: q(searchNames, 'кардан'),
      configGroup: 'drivetrain:rwd',
    },
    {
      name: 'Редуктор задний',
      slug: `${prefix}-rear-diff-rwd`,
      category: 'suspension' as PartCategory,
      schematicZoneCode: null,
      searchQueries: q(searchNames, 'редуктор задний'),
      configGroup: 'drivetrain:rwd',
    },
  ]
}

export function fuelPumpHP(
  prefix: string,
  searchNames: string[],
  engineConfig: string,
): PartData {
  const slugConfig = engineConfig.replace(/\./g, '-')
  return {
    name: 'ТНВД',
    slug: `${prefix}-fuel-pump-hp-${slugConfig}`,
    category: 'other' as PartCategory,
    schematicZoneCode: null,
    searchQueries: [
      ...searchNames.map((n) => `тнвд ${n}`),
      ...searchNames.map((n) => `топливный насос высокого давления ${n}`),
    ],
    configGroup: `engine:${engineConfig}`,
  }
}

export function injectorsDiesel(
  prefix: string,
  searchNames: string[],
  engineConfig: string,
): PartData {
  const slugConfig = engineConfig.replace(/\./g, '-')
  return {
    name: 'Форсунки дизельные (Common Rail)',
    slug: `${prefix}-injectors-diesel-${slugConfig}`,
    category: 'other' as PartCategory,
    schematicZoneCode: null,
    searchQueries: [
      ...searchNames.map((n) => `форсунка дизель ${n}`),
      ...searchNames.map((n) => `форсунка common rail ${n}`),
      ...searchNames.map((n) => `инжектор дизель ${n}`),
    ],
    configGroup: `engine:${engineConfig}`,
  }
}

export function drivetrainAWD(
  prefix: string,
  searchNames: string[],
): PartData[] {
  const base = {
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    configGroup: 'drivetrain:awd',
  }
  return [
    {
      ...base,
      name: 'Привод передний левый (ШРУС)',
      slug: `${prefix}-driveshaft-fl-awd`,
      searchQueries: q(searchNames, 'привод передний левый'),
    },
    {
      ...base,
      name: 'Привод передний правый (ШРУС)',
      slug: `${prefix}-driveshaft-fr-awd`,
      searchQueries: q(searchNames, 'привод передний правый'),
    },
    {
      name: 'Раздаточная коробка',
      slug: `${prefix}-transfer-case`,
      category: 'transmission' as PartCategory,
      schematicZoneCode: null,
      searchQueries: q(searchNames, 'раздатка'),
      configGroup: 'drivetrain:awd',
    },
    {
      ...base,
      name: 'Кардан задний',
      slug: `${prefix}-rear-driveshaft-awd`,
      searchQueries: q(searchNames, 'кардан задний'),
    },
    {
      ...base,
      name: 'Редуктор задний',
      slug: `${prefix}-rear-diff-awd`,
      searchQueries: q(searchNames, 'редуктор задний'),
    },
  ]
}
