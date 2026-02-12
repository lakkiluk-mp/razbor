import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainAWD } from './builders'

const P = 'lada-niva'
const S = ['lada niva', 'лада нива', 'нива', 'niva']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.7-83', 'ВАЗ-21214', 83, ['21214']),
  engine(P, S, '1.7-79', 'ВАЗ-21213', 79, ['21213']),
  transmission(P, S, 'mt', 'МКПП 5-ступ'),
  ...drivetrainAWD(P, S),
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
      if (!part.configGroup) return true
      if (!generation.availableConfigs) return true
      return generation.availableConfigs.includes(part.configGroup)
    })
  },
}
