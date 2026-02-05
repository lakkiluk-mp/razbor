import { BodyType } from '@prisma/client'
import type { PartData, GenerationData } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainFWD } from './builders'

const P = 'renault-logan'
const S = ['renault logan', 'рено логан', 'логан']

const modelSpecificParts: PartData[] = [
  // K7J — только 1 поколение (1.4)
  engine(P, S, '1.4-75', 'K7J', 75),
  // K7M и K4M — общие для обоих поколений
  engine(P, S, '1.6-k7m', 'K7M', 82),
  engine(P, S, '1.6-k4m', 'K4M', 102),
  // H4M — только 2 поколение
  engine(P, S, '1.6-113', 'H4M', 113),
  // КПП
  transmission(P, S, 'mt', 'МКПП 5-ступ'),
  transmission(P, S, 'at', 'АКПП 4-ступ'),
  transmission(P, S, 'amt', 'АМТ (робот)'),
  // Привод — только FWD
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'II (L52) (2014-2022)',
    slug: 'l52',
    yearStart: 2014,
    yearEnd: 2022,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-k7m',
      'engine:1.6-k4m',
      'engine:1.6-113',
      'transmission:mt',
      'transmission:at',
      'transmission:amt',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'I (L90) (2004-2016)',
    slug: 'l90',
    yearStart: 2004,
    yearEnd: 2016,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-75',
      'engine:1.6-k7m',
      'engine:1.6-k4m',
      'transmission:mt',
      'transmission:at',
      'drivetrain:fwd',
    ],
  },
]

export const renaultLoganSeed = {
  brand: {
    name: 'Renault',
    slug: 'renault',
    logo: null,
    sortOrder: 4,
  },

  model: {
    name: 'Logan',
    slug: 'logan',
    isPopular: true,
    sortOrder: 1,
  },

  generations,

  getPartsForGeneration(generation: GenerationData): PartData[] {
    const allParts = [...getBaseParts(P, S), ...modelSpecificParts]

    return allParts.filter((part) => {
      if (!part.configGroup) return true
      if (!generation.availableConfigs) return true
      return generation.availableConfigs.includes(part.configGroup)
    })
  },
}
