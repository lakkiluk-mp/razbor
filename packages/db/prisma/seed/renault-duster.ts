import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, fuelPumpHP, transmission, drivetrainFWD, drivetrainAWD } from './builders'

const P = 'renault-duster'
const S = ['renault duster', 'рено дастер', 'дастер']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.6-k4m', 'K4M', 102, ['8201315743', '6001549002']),
  engine(P, S, '1.5-109', 'K9K', 109, ['100015299R']),
  fuelPumpHP(P, S, '1.5-109'),
  engine(P, S, '1.6-113', 'H4M', 113, ['8201583992']),
  engine(P, S, '2.0-143', 'F4R', 143, ['100017527R']),
  engine(P, S, '1.3-149', 'H5Ht', 149, ['100011218R']),
  fuelPumpHP(P, S, '1.3-149'),
  transmission(P, S, 'mt', 'МКПП 5-ступ', ['320100676R', '320103500R', '320103334R', '320109037R']),
  transmission(P, S, 'at', 'АКПП 4-ступ', ['8201114873']),
  transmission(P, S, 'mt6', 'МКПП 6-ступ TL8', ['320108363R']),
  transmission(P, S, 'cvt', 'Вариатор (CVT)', ['320107637R']),
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (HS) (2010-2021)',
    slug: 'hs',
    yearStart: 2010,
    yearEnd: 2021,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-k4m',
      'engine:1.5-109',
      'engine:1.6-113',
      'engine:2.0-143',
      'transmission:mt',
      'transmission:mt6',
      'transmission:at',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (HM) (2020-2022)',
    slug: 'hm',
    yearStart: 2020,
    yearEnd: 2022,
    bodyType: 'crossover' as BodyType,
    isActive: false,
    availableConfigs: [
      'engine:1.3-149',
      'engine:1.5-109',
      'engine:1.6-113',
      'engine:2.0-143',
      'transmission:mt',
      'transmission:mt6',
      'transmission:cvt',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
]

export const renaultDusterSeed = {
  brand: {
    name: 'Renault',
    slug: 'renault',
    logo: null,
    sortOrder: 4,
  },

  model: {
    name: 'Duster',
    slug: 'duster',
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
