import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainFWD } from './builders'

const P = 'lada-granta'
const S = ['lada granta', 'лада гранта', 'гранта', 'granta']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.6-87', 'ВАЗ-11186', 87, ['11186']),
  engine(P, S, '1.6-90', 'ВАЗ-11182', 90, ['11182']),
  engine(P, S, '1.6-106', 'ВАЗ-21129', 106, ['21129']),
  transmission(P, S, 'mt', 'МКПП 5-ступ'),
  transmission(P, S, 'at', 'АКПП 4-ступ (Jatco JF414E)', ['JF414E']),
  transmission(P, S, 'amt', 'Робот (АМТ 2182)'),
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (2011-н.в.)',
    slug: 'granta',
    yearStart: 2011,
    yearEnd: null,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-87',
      'engine:1.6-90',
      'engine:1.6-106',
      'transmission:mt',
      'transmission:at',
      'transmission:amt',
      'drivetrain:fwd',
    ],
  },
]

export const ladaGrantaSeed = {
  brand: {
    name: 'Lada',
    slug: 'lada',
    logo: null,
    sortOrder: 8,
  },

  model: {
    name: 'Granta',
    slug: 'granta',
    isPopular: true,
    sortOrder: 2,
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
