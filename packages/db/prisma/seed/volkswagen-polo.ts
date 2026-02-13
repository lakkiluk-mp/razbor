import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, fuelPumpHP, transmission, drivetrainFWD } from './builders'

const P = 'volkswagen-polo'
const S = ['volkswagen polo', 'фольксваген поло', 'поло', 'polo', 'vw polo']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // EA111 engines (Mk5 only)
  engine(P, S, '1.6-85', 'CFNB', 85),
  engine(P, S, '1.6-105', 'CFNA', 105, ['03C100038F']),

  // EA211 engines (Mk5 mid + Mk6)
  engine(P, S, '1.6-90', 'CFW', 90),
  engine(P, S, '1.6-110', 'CWVA', 110, ['04E100037C']),
  engine(P, S, '1.4-125', 'CZCA', 125, ['04E100033B']),
  fuelPumpHP(P, S, '1.4-125'),

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
    name: 'V (Mk5) Sedan (2010-2020)',
    slug: '612',
    yearStart: 2010,
    yearEnd: 2020,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-85', 'engine:1.6-105', 'engine:1.6-90', 'engine:1.6-110', 'engine:1.4-125',
      'transmission:mt5', 'transmission:mt6', 'transmission:at6', 'transmission:dsg',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'VI (Mk6) Liftback CK (2020-2022)',
    slug: 'ck',
    yearStart: 2020,
    yearEnd: 2022,
    bodyType: 'liftback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-90', 'engine:1.6-110', 'engine:1.4-125',
      'transmission:mt5', 'transmission:at6', 'transmission:dsg',
      'drivetrain:fwd',
    ],
  },
]

export const volkswagenPoloSeed = {
  brand: {
    name: 'Volkswagen',
    slug: 'volkswagen',
    logo: null,
    sortOrder: 10,
  },

  model: {
    name: 'Polo',
    slug: 'polo',
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
