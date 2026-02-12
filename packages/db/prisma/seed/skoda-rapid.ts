import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, fuelPumpHP, transmission, drivetrainFWD } from './builders'

const P = 'skoda-rapid'
const S = ['skoda rapid', 'шкода рапид', 'рапид', 'rapid']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // EA111 engines (Gen 1 only)
  engine(P, S, '1.2-75', 'CGPC', 75, ['03E100033R']),
  engine(P, S, '1.4-122', 'CAXA', 122, ['03C100038P']),
  fuelPumpHP(P, S, '1.4-122'),
  engine(P, S, '1.6-105', 'CFNA', 105, ['03C100038F']),

  // EA211 engines (Gen 1 mid + Gen 2)
  engine(P, S, '1.4-125', 'CZCA', 125, ['04E100033B']),
  fuelPumpHP(P, S, '1.4-125'),
  engine(P, S, '1.6-90', 'CFW', 90),
  engine(P, S, '1.6-110', 'CWVA', 110, ['04E100037C']),

  // КПП
  transmission(P, S, 'mt5', 'МКПП 5-ступ MQ200', ['02T300046R']),
  transmission(P, S, 'mt6', 'МКПП 6-ступ MQ200'),
  transmission(P, S, 'at6', 'АКПП 6-ступ (Aisin 09G)', ['09G300034']),
  transmission(P, S, 'dsg', 'DSG-7 DQ200 (робот)', ['0AM300048']),

  // Привод — только FWD
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (NH3) (2012-2020)',
    slug: 'nh3',
    yearStart: 2012,
    yearEnd: 2020,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.2-75', 'engine:1.4-122', 'engine:1.4-125',
      'engine:1.6-90', 'engine:1.6-105', 'engine:1.6-110',
      'transmission:mt5', 'transmission:mt6', 'transmission:at6', 'transmission:dsg',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (2020-2023)',
    slug: 'rapid2',
    yearStart: 2020,
    yearEnd: 2023,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-90', 'engine:1.6-110', 'engine:1.4-125',
      'transmission:mt5', 'transmission:mt6', 'transmission:at6', 'transmission:dsg',
      'drivetrain:fwd',
    ],
  },
]

export const skodaRapidSeed = {
  brand: {
    name: 'Skoda',
    slug: 'skoda',
    logo: null,
    sortOrder: 9,
  },

  model: {
    name: 'Rapid',
    slug: 'rapid',
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
