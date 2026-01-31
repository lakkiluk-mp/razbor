import { PartCategory } from '@prisma/client'
import type { PartData } from './types'

function q(searchNames: string[], suffix: string): string[] {
  return searchNames.map((n) => `${suffix} ${n}`)
}

export function engine(
  prefix: string,
  searchNames: string[],
  config: string,
  code: string,
  hp: number,
): PartData {
  const vol = config.replace(/-\d+$/, '')
  const slugConfig = config.replace(/\./g, '-')
  return {
    name: `Двигатель ${vol} ${code} (${hp} л.с.)`,
    slug: `${prefix}-engine-${slugConfig}`,
    category: 'engine' as PartCategory,
    schematicZoneCode: 'engine',
    searchQueries: [
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
): PartData {
  const isAuto = config.startsWith('at')
  const specificType = isAuto ? 'акпп' : 'мкпп'
  return {
    name,
    slug: `${prefix}-transmission-${config}`,
    category: 'transmission' as PartCategory,
    schematicZoneCode: 'transmission',
    searchQueries: [
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
      searchQueries: q(prefix, searchNames, 'привод левый'),
    },
    {
      ...base,
      name: 'Привод правый (ШРУС)',
      slug: `${prefix}-driveshaft-r`,
      searchQueries: q(prefix, searchNames, 'привод правый'),
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
      searchQueries: q(prefix, searchNames, 'кардан'),
      configGroup: 'drivetrain:rwd',
    },
    {
      name: 'Редуктор задний',
      slug: `${prefix}-rear-diff-rwd`,
      category: 'suspension' as PartCategory,
      schematicZoneCode: null,
      searchQueries: q(prefix, searchNames, 'редуктор задний'),
      configGroup: 'drivetrain:rwd',
    },
  ]
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
      searchQueries: q(prefix, searchNames, 'привод передний левый'),
    },
    {
      ...base,
      name: 'Привод передний правый (ШРУС)',
      slug: `${prefix}-driveshaft-fr-awd`,
      searchQueries: q(prefix, searchNames, 'привод передний правый'),
    },
    {
      name: 'Раздаточная коробка',
      slug: `${prefix}-transfer-case`,
      category: 'transmission' as PartCategory,
      schematicZoneCode: null,
      searchQueries: q(prefix, searchNames, 'раздатка'),
      configGroup: 'drivetrain:awd',
    },
    {
      ...base,
      name: 'Кардан задний',
      slug: `${prefix}-rear-driveshaft-awd`,
      searchQueries: q(prefix, searchNames, 'кардан задний'),
    },
    {
      ...base,
      name: 'Редуктор задний',
      slug: `${prefix}-rear-diff-awd`,
      searchQueries: q(prefix, searchNames, 'редуктор задний'),
    },
  ]
}
