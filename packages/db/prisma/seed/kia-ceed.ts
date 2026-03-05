import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, fuelPumpHP, turbo, intercooler, drivetrainFWD } from './builders'

const P = 'kia-ceed'
const S = ['kia ceed', 'киа сид', 'сид']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // ED — G4FA 1.4 MPI
  engine(P, S, '1.4-109', 'G4FA', 109, ['G4FA']),
  starter(P, S, '1.4-109'),
  alternator(P, S, '1.4-109'),

  // ED — G4FC 1.6 MPI
  engine(P, S, '1.6-122', 'G4FC', 122, ['G4FC']),
  starter(P, S, '1.6-122'),
  alternator(P, S, '1.6-122'),

  // ED — G4GC 2.0 MPI
  engine(P, S, '2.0-143', 'G4GC', 143, ['G4GC']),
  starter(P, S, '2.0-143'),
  alternator(P, S, '2.0-143'),

  // JD, CD — G4LC 1.4 MPI
  engine(P, S, '1.4-100', 'G4LC', 100, ['G4LC']),
  starter(P, S, '1.4-100'),
  alternator(P, S, '1.4-100'),

  // JD, CD — G4FG 1.6 MPI
  engine(P, S, '1.6-130', 'G4FG', 130, ['G4FG']),
  starter(P, S, '1.6-130'),
  alternator(P, S, '1.6-130'),

  // JD — G4FD 1.6 GDI
  engine(P, S, '1.6-135', 'G4FD', 135, ['G4FD']),
  starter(P, S, '1.6-135'),
  alternator(P, S, '1.6-135'),
  fuelPumpHP(P, S, '1.6-135'),

  // JD — G4FJ 1.6T GDI (GT)
  engine(P, S, '1.6t-204', 'G4FJ', 204, ['G4FJ']),
  starter(P, S, '1.6t-204'),
  alternator(P, S, '1.6t-204'),
  fuelPumpHP(P, S, '1.6t-204'),
  turbo(P, S, '1.6t-204', 'G4FJ'),
  intercooler(P, S, '1.6t-204'),

  // CD — G4LD 1.4T GDI
  engine(P, S, '1.4t-140', 'G4LD', 140, ['G4LD']),
  starter(P, S, '1.4t-140'),
  alternator(P, S, '1.4t-140'),
  fuelPumpHP(P, S, '1.4t-140'),
  turbo(P, S, '1.4t-140', 'G4LD'),
  intercooler(P, S, '1.4t-140'),

  // CD — G4LH 1.5T GDI
  engine(P, S, '1.5t-150', 'G4LH', 150),
  starter(P, S, '1.5t-150'),
  alternator(P, S, '1.5t-150'),
  fuelPumpHP(P, S, '1.5t-150'),
  turbo(P, S, '1.5t-150', 'G4LH'),
  intercooler(P, S, '1.5t-150'),

  // КПП
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at6', 'АКПП 6-ступ'),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'robot6', 'Робот DCT 6-ступ'),
  ecuTransmission(P, S, 'robot6'),
  transmission(P, S, 'robot7', 'Робот DCT 7-ступ'),
  ecuTransmission(P, S, 'robot7'),

  // Привод — только FWD
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (ED) (2006-2012)',
    slug: 'ed',
    yearStart: 2006,
    yearEnd: 2012,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-109',
      'engine:1.6-122',
      'engine:2.0-143',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'I (ED) SW (2006-2012)',
    slug: 'ed-wagon',
    yearStart: 2006,
    yearEnd: 2012,
    bodyType: 'wagon' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-109',
      'engine:1.6-122',
      'engine:2.0-143',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (JD) (2012-2018)',
    slug: 'jd',
    yearStart: 2012,
    yearEnd: 2018,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-100',
      'engine:1.6-130',
      'engine:1.6-135',
      'engine:1.6t-204',
      'transmission:mt6',
      'transmission:at6',
      'transmission:robot6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (JD) SW (2012-2018)',
    slug: 'jd-wagon',
    yearStart: 2012,
    yearEnd: 2018,
    bodyType: 'wagon' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-100',
      'engine:1.6-130',
      'engine:1.6-135',
      'transmission:mt6',
      'transmission:at6',
      'transmission:robot6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'III (CD) (2018-2022)',
    slug: 'cd',
    yearStart: 2018,
    yearEnd: 2022,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-100',
      'engine:1.6-130',
      'engine:1.4t-140',
      'engine:1.5t-150',
      'transmission:mt6',
      'transmission:at6',
      'transmission:robot7',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'III (CD) SW (2018-2022)',
    slug: 'cd-wagon',
    yearStart: 2018,
    yearEnd: 2022,
    bodyType: 'wagon' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-130',
      'engine:1.4t-140',
      'engine:1.5t-150',
      'transmission:at6',
      'transmission:robot7',
      'drivetrain:fwd',
    ],
  },
]

export const kiaCeedSeed = {
  brand: {
    name: 'Kia',
    slug: 'kia',
    logo: 'M13.923 14.175c0 .046.015.072.041.072a.123.123 0 0 0 .058-.024l7.48-4.854a.72.72 0 0 1 .432-.13h1.644c.252 0 .422.168.422.42v3.139c0 .38-.084.6-.42.801l-1.994 1.2a.137.137 0 0 1-.067.024c-.024 0-.048-.019-.048-.088v-3.663c0-.043-.012-.071-.041-.071a.113.113 0 0 0-.058.024l-5.466 3.551a.733.733 0 0 1-.42.127h-3.624c-.254 0-.422-.168-.422-.422V9.757c0-.033-.015-.064-.044-.064a.118.118 0 0 0-.057.024L7.732 11.88c-.036.024-.046.041-.046.058 0 .014.008.029.032.055l2.577 2.575c.034.034.058.06.058.089 0 .024-.039.043-.084.043H7.94c-.183 0-.324-.026-.423-.125l-1.562-1.56a.067.067 0 0 0-.048-.024.103.103 0 0 0-.048.015l-2.61 1.57a.72.72 0 0 1-.423.122H.425C.168 14.7 0 14.53 0 14.279v-3.08c0-.38.084-.6.422-.8L2.43 9.192a.103.103 0 0 1 .052-.016c.032 0 .048.03.048.1V13.4c0 .043.01.063.041.063a.144.144 0 0 0 .06-.024L9.407 9.36a.733.733 0 0 1 .446-.124h3.648c.252 0 .422.168.422.42l-.002 4.518z',
    sortOrder: 5,
  },

  model: {
    name: 'Ceed',
    slug: 'ceed',
    isPopular: true,
    sortOrder: 4,
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
