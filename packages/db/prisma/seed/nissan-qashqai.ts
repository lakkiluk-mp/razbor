import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, fuelPumpHP, transmission, drivetrainFWD, drivetrainAWD } from './builders'

const P = 'nissan-qashqai'
const S = ['nissan qashqai', 'ниссан кашкай', 'кашкай', 'qashqai']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.6-114', 'H4M', 114, ['8201583992']),
  engine(P, S, '2.0-141', 'MR20DE', 141, ['10102JD2MC']),
  engine(P, S, '2.0-144', 'MR20DD', 144, ['101024EF1A']),
  fuelPumpHP(P, S, '2.0-144'),
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ', ['32010JD200']),
  transmission(P, S, 'cvt-jf015e', 'Вариатор (Jatco JF015E)', ['JF015E']),
  transmission(P, S, 'cvt-jf011e', 'Вариатор (Jatco JF011E)', ['JF011E']),
  transmission(P, S, 'cvt-jf016e', 'Вариатор (Jatco JF016E)', ['JF016E']),
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (J10) (2006-2013)',
    slug: 'j10',
    yearStart: 2006,
    yearEnd: 2013,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-114',
      'engine:2.0-141',
      'transmission:mt5',
      'transmission:mt6',
      'transmission:cvt-jf015e',
      'transmission:cvt-jf011e',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (J11) (2013-2022)',
    slug: 'j11',
    yearStart: 2013,
    yearEnd: 2022,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-144',
      'transmission:mt6',
      'transmission:cvt-jf016e',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
]

export const nissanQashqaiSeed = {
  brand: {
    name: 'Nissan',
    slug: 'nissan',
    logo: null,
    sortOrder: 12,
  },

  model: {
    name: 'Qashqai',
    slug: 'qashqai',
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
