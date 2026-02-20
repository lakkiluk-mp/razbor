import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, fuelPumpHP, turbo, intercooler, drivetrainFWD } from './builders'

const P = 'kia-optima'
const S = ['kia optima', 'киа оптима', 'оптима']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // TF MPI
  engine(P, S, '2.0-150', 'G4KD', 150),
  starter(P, S, '2.0-150'),
  alternator(P, S, '2.0-150'),

  // TF рестайл + JF — GDI
  engine(P, S, '2.0-150g', 'G4ND', 150),
  starter(P, S, '2.0-150g'),
  alternator(P, S, '2.0-150g'),
  fuelPumpHP(P, S, '2.0-150g'),

  // TF MPI
  engine(P, S, '2.4-180', 'G4KE', 180),
  starter(P, S, '2.4-180'),
  alternator(P, S, '2.4-180'),

  // JF GDI
  engine(P, S, '2.4-188', 'G4KJ', 188),
  starter(P, S, '2.4-188'),
  alternator(P, S, '2.4-188'),
  fuelPumpHP(P, S, '2.4-188'),

  // JF Turbo GDI
  engine(P, S, '2.0t-245', 'G4KF', 245),
  starter(P, S, '2.0t-245'),
  alternator(P, S, '2.0t-245'),
  fuelPumpHP(P, S, '2.0t-245'),
  turbo(P, S, '2.0t-245', 'G4KF'),
  intercooler(P, S, '2.0t-245'),

  // КПП
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at6', 'АКПП 6-ступ'),
  ecuTransmission(P, S, 'at6'),

  // Привод — только FWD
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'IV (JF) (2016-2020)',
    slug: 'jf',
    yearStart: 2016,
    yearEnd: 2020,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150g',
      'engine:2.4-188',
      'engine:2.0t-245',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'III (TF) (2010-2016)',
    slug: 'tf',
    yearStart: 2010,
    yearEnd: 2016,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150',
      'engine:2.0-150g',
      'engine:2.4-180',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
]

export const kiaOptimaSeed = {
  brand: {
    name: 'Kia',
    slug: 'kia',
    logo: 'M13.923 14.175c0 .046.015.072.041.072a.123.123 0 0 0 .058-.024l7.48-4.854a.72.72 0 0 1 .432-.13h1.644c.252 0 .422.168.422.42v3.139c0 .38-.084.6-.42.801l-1.994 1.2a.137.137 0 0 1-.067.024c-.024 0-.048-.019-.048-.088v-3.663c0-.043-.012-.071-.041-.071a.113.113 0 0 0-.058.024l-5.466 3.551a.733.733 0 0 1-.42.127h-3.624c-.254 0-.422-.168-.422-.422V9.757c0-.033-.015-.064-.044-.064a.118.118 0 0 0-.057.024L7.732 11.88c-.036.024-.046.041-.046.058 0 .014.008.029.032.055l2.577 2.575c.034.034.058.06.058.089 0 .024-.039.043-.084.043H7.94c-.183 0-.324-.026-.423-.125l-1.562-1.56a.067.067 0 0 0-.048-.024.103.103 0 0 0-.048.015l-2.61 1.57a.72.72 0 0 1-.423.122H.425C.168 14.7 0 14.53 0 14.279v-3.08c0-.38.084-.6.422-.8L2.43 9.192a.103.103 0 0 1 .052-.016c.032 0 .048.03.048.1V13.4c0 .043.01.063.041.063a.144.144 0 0 0 .06-.024L9.407 9.36a.733.733 0 0 1 .446-.124h3.648c.252 0 .422.168.422.42l-.002 4.518z',
    sortOrder: 5,
  },

  model: {
    name: 'Optima',
    slug: 'optima',
    isPopular: false,
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
