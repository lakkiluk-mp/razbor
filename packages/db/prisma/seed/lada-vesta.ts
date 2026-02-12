import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainFWD } from './builders'

const P = 'lada-vesta'
const S = ['lada vesta', 'лада веста', 'веста', 'vesta']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.6-106', 'ВАЗ-21129', 106, ['21129']),
  engine(P, S, '1.6-90', 'ВАЗ-11182', 90, ['11182']),
  engine(P, S, '1.8-122', 'ВАЗ-21179', 122, ['21179']),
  engine(P, S, '1.6-113', 'H4M', 113, ['8201583992']),
  transmission(P, S, 'mt', 'МКПП 5-ступ'),
  transmission(P, S, 'cvt', 'Вариатор (Jatco JF015E)', ['JF015E']),
  transmission(P, S, 'amt', 'Робот (АМТ 2182)'),
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (2015-н.в.)',
    slug: 'vesta',
    yearStart: 2015,
    yearEnd: null,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-106',
      'engine:1.6-90',
      'engine:1.8-122',
      'transmission:mt',
      'transmission:cvt',
      'transmission:amt',
      'drivetrain:fwd',
    ],
  },
]

export const ladaVestaSeed = {
  brand: {
    name: 'Lada',
    slug: 'lada',
    logo: null,
    sortOrder: 8,
  },

  model: {
    name: 'Vesta',
    slug: 'vesta',
    isPopular: true,
    sortOrder: 1,
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
