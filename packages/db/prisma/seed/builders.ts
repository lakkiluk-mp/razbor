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

export function starter(
  prefix: string,
  searchNames: string[],
  engineConfig: string,
  engineCode?: string,
): PartData {
  const slugConfig = engineConfig.replace(/\./g, '-')
  const vol = engineConfig.replace(/-\d+\w*$/, '')
  return {
    name: 'Стартер',
    slug: `${prefix}-starter-${slugConfig}`,
    category: 'electrical' as PartCategory,
    schematicZoneCode: null,
    searchQueries: [
      ...(engineCode ? searchNames.map((n) => `стартер ${engineCode} ${n}`) : []),
      ...searchNames.map((n) => `стартер ${vol} ${n}`),
      ...searchNames.map((n) => `стартер ${n}`),
    ],
    configGroup: `engine:${engineConfig}`,
  }
}

export function alternator(
  prefix: string,
  searchNames: string[],
  engineConfig: string,
  engineCode?: string,
): PartData {
  const slugConfig = engineConfig.replace(/\./g, '-')
  const vol = engineConfig.replace(/-\d+\w*$/, '')
  return {
    name: 'Генератор',
    slug: `${prefix}-alternator-${slugConfig}`,
    category: 'electrical' as PartCategory,
    schematicZoneCode: null,
    searchQueries: [
      ...(engineCode ? searchNames.map((n) => `генератор ${engineCode} ${n}`) : []),
      ...searchNames.map((n) => `генератор ${vol} ${n}`),
      ...searchNames.map((n) => `генератор ${n}`),
    ],
    configGroup: `engine:${engineConfig}`,
  }
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

export function turbo(
  prefix: string,
  searchNames: string[],
  engineConfig: string,
  engineCode: string,
  oemCode?: string,
  side?: 'left' | 'right',
): PartData | SharedPartRef {
  if (oemCode) {
    const sharedDef = findSharedPart(oemCode)
    if (sharedDef) {
      return { type: 'shared', oemCode, configGroup: `engine:${engineConfig}` }
    }
  }
  const slugConfig = engineConfig.replace(/\./g, '-')
  const vol = engineConfig.replace(/-\d+\w*$/, '')
  const sideRu = side === 'left' ? 'левая' : side === 'right' ? 'правая' : ''
  const sideSuffix = side ? `-${side}` : ''
  const namePrefix = sideRu ? `Турбина ${sideRu}` : 'Турбина'
  const oem = oemCode ? [`oem:${oemCode}`] : []
  return {
    name: `${namePrefix} ${engineCode}`,
    slug: `${prefix}-turbo${sideSuffix}-${slugConfig}`,
    category: 'engine' as PartCategory,
    schematicZoneCode: null,
    searchQueries: [
      ...oem,
      ...searchNames.map((n) => sideRu
        ? `турбина ${sideRu} ${engineCode} ${n}`
        : `турбина ${engineCode} ${n}`),
      ...searchNames.map((n) => sideRu
        ? `турбина ${sideRu} ${vol} ${n}`
        : `турбина ${vol} ${n}`),
      ...searchNames.map((n) => `турбокомпрессор ${n}`),
    ],
    configGroup: `engine:${engineConfig}`,
  }
}

export function supercharger(
  prefix: string,
  searchNames: string[],
  engineConfig: string,
  engineCode: string,
): PartData {
  const slugConfig = engineConfig.replace(/\./g, '-')
  const vol = engineConfig.replace(/-\d+\w*$/, '')
  return {
    name: `Компрессор (нагнетатель) ${engineCode}`,
    slug: `${prefix}-supercharger-${slugConfig}`,
    category: 'engine' as PartCategory,
    schematicZoneCode: null,
    searchQueries: [
      ...searchNames.map((n) => `компрессор ${engineCode} ${n}`),
      ...searchNames.map((n) => `компрессор ${vol} ${n}`),
      ...searchNames.map((n) => `нагнетатель ${n}`),
    ],
    configGroup: `engine:${engineConfig}`,
  }
}

export function intercooler(
  prefix: string,
  searchNames: string[],
  engineConfig: string,
): PartData {
  const slugConfig = engineConfig.replace(/\./g, '-')
  const vol = engineConfig.replace(/-\d+\w*$/, '')
  return {
    name: 'Интеркулер',
    slug: `${prefix}-intercooler-${slugConfig}`,
    category: 'cooling' as PartCategory,
    schematicZoneCode: null,
    searchQueries: [
      ...searchNames.map((n) => `интеркулер ${vol} ${n}`),
      ...searchNames.map((n) => `интеркулер ${n}`),
      ...searchNames.map((n) => `интеркуллер ${n}`),
      ...searchNames.map((n) => `радиатор интеркулера ${n}`),
    ],
    configGroup: `engine:${engineConfig}`,
  }
}

export function ecuTransmission(
  prefix: string,
  searchNames: string[],
  transmissionConfig: string,
): PartData {
  const slugConfig = transmissionConfig.replace(/\./g, '-')
  const isCvt = transmissionConfig.startsWith('cvt')
  const isRobot = transmissionConfig.startsWith('amt') || transmissionConfig.startsWith('robot')
  const isDsg = transmissionConfig.startsWith('dsg')
  const typeName = isCvt ? 'ЭБУ вариатора' : isRobot ? 'ЭБУ робота' : isDsg ? 'ЭБУ DSG' : 'ЭБУ АКПП'
  const typeSearch = isCvt ? 'вариатором' : isRobot ? 'роботом' : isDsg ? 'дсг' : 'акпп'
  const typeShort = isCvt ? 'вариатор' : isRobot ? 'робот' : isDsg ? 'dsg' : 'акпп'
  return {
    name: typeName,
    slug: `${prefix}-ecu-transmission-${slugConfig}`,
    category: 'electrical' as PartCategory,
    schematicZoneCode: null,
    searchQueries: [
      ...(isDsg ? searchNames.map((n) => `мехатроник ${n}`) : []),
      ...searchNames.map((n) => `блок управления ${typeSearch} ${n}`),
      ...searchNames.map((n) => `эбу ${typeShort} ${n}`),
      ...searchNames.map((n) => `блок управления коробкой ${n}`),
      ...searchNames.map((n) => `tcm ${n}`),
    ],
    configGroup: `transmission:${transmissionConfig}`,
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
