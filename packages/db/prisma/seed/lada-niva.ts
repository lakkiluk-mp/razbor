import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { isSharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainAWD } from './builders'

const P = 'lada-niva'
const S = ['lada niva', 'лада нива', 'нива', 'niva']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.7-83', 'ВАЗ-21214', 83, ['21214']),
  engine(P, S, '1.7-79', 'ВАЗ-21213', 79, ['21213']),
  transmission(P, S, 'mt', 'МКПП 5-ступ'),
  ...drivetrainAWD(P, S),
  {
    name: 'Дверные карты (комплект)',
    slug: `${P}-door-cards-set`,
    category: 'interior' as const,
    schematicZoneCode: null,
    searchQueries: S.map((s) => `дверные карты ${s}`),
  },
  {
    name: 'Рулевой редуктор',
    slug: `${P}-steering-gearbox`,
    category: 'suspension' as const,
    schematicZoneCode: null,
    searchQueries: S.map((s) => `рулевой редуктор ${s}`),
  },
  {
    name: 'Рулевой редуктор с ГУР',
    slug: `${P}-steering-gearbox-ps`,
    category: 'suspension' as const,
    schematicZoneCode: null,
    searchQueries: S.map((s) => `рулевой редуктор гур ${s}`),
  },
  {
    name: 'Задний мост',
    slug: `${P}-rear-axle`,
    category: 'suspension' as const,
    schematicZoneCode: null,
    searchQueries: S.map((s) => `задний мост ${s}`),
  },
]

const EXCLUDE_PARTS = [
  'Подрамник задний',
  'Блок комфорта',
  'Дверная карта задняя левая',
  'Дверная карта задняя правая',
  'Дверная карта передняя левая',
  'Дверная карта передняя правая',
  'Рулевая рейка',
  'Ступица задняя левая',
  'Ступица задняя правая',
  'Суппорт/барабан задний левый',
  'Суппорт/барабан задний правый',
  'Диск тормозной задний',
]

const generations: GenerationData[] = [
  {
    name: 'I (1977-н.в.)',
    slug: '2121',
    yearStart: 1977,
    yearEnd: null,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.7-83',
      'engine:1.7-79',
      'transmission:mt',
      'drivetrain:awd',
    ],
  },
]

export const ladaNivaSeed = {
  brand: {
    name: 'Lada',
    slug: 'lada',
    logo: null,
    sortOrder: 8,
  },

  model: {
    name: 'Niva',
    slug: 'niva',
    isPopular: true,
    sortOrder: 3,
  },

  generations,

  getPartsForGeneration(generation: GenerationData): (PartData | SharedPartRef)[] {
    const allParts = [...getBaseParts(P, S), ...modelSpecificParts]

    return allParts.filter((part) => {
      if (!isSharedPartRef(part) && EXCLUDE_PARTS.includes(part.name)) return false
      if (!part.configGroup) return true
      if (!generation.availableConfigs) return true
      return generation.availableConfigs.includes(part.configGroup)
    })
  },
}
