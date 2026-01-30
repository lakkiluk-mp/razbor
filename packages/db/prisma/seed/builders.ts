import { PartCategory } from '@prisma/client'
import type { PartData } from './types'

function q(prefix: string, searchNames: string[], suffix: string): string[] {
  return searchNames.map((n) => `${suffix} ${n}`)
    .concat([`${suffix} ${prefix}`])
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
      ...q(prefix, searchNames, 'двигатель'),
      ...q(prefix, searchNames, 'мотор'),
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
  return {
    name,
    slug: `${prefix}-transmission-${config}`,
    category: 'transmission' as PartCategory,
    schematicZoneCode: 'transmission',
    searchQueries: [
      ...q(prefix, searchNames, 'коробка'),
      ...q(prefix, searchNames, name.toLowerCase()),
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
