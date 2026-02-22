import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainFWD } from './builders'

const P = 'kia-rio'
const S = ['kia rio', 'киа рио', 'рио']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.3-84', 'A3E', 84),
  starter(P, S, '1.3-84'),
  alternator(P, S, '1.3-84'),
  engine(P, S, '1.5-95', 'A5E', 95),
  starter(P, S, '1.5-95'),
  alternator(P, S, '1.5-95'),
  engine(P, S, '1.5-108', 'A5D', 108),
  starter(P, S, '1.5-108'),
  alternator(P, S, '1.5-108'),

  engine(P, S, '1.4-97', 'G4EE', 97),
  starter(P, S, '1.4-97'),
  alternator(P, S, '1.4-97'),
  engine(P, S, '1.6-112', 'G4ED', 112),
  starter(P, S, '1.6-112'),
  alternator(P, S, '1.6-112'),

  engine(P, S, '1.4-107', 'G4FA', 107, ['G4FA']),
  starter(P, S, '1.4-107'),
  alternator(P, S, '1.4-107'),
  engine(P, S, '1.6-123', 'G4FC', 123, ['G4FC']),
  starter(P, S, '1.6-123'),
  alternator(P, S, '1.6-123'),
  engine(P, S, '1.6-138', 'G4FD', 138, ['G4FD']),
  starter(P, S, '1.6-138'),
  alternator(P, S, '1.6-138'),

  engine(P, S, '1.4-100', 'G4LC', 100, ['G4LC']),
  starter(P, S, '1.4-100'),
  alternator(P, S, '1.4-100'),
  engine(P, S, '1.6-123g', 'G4FG', 123, ['G4FG']),
  starter(P, S, '1.6-123g'),
  alternator(P, S, '1.6-123g'),

  // КПП
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at4', 'АКПП 4-ступ'),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'at6', 'АКПП 6-ступ'),
  ecuTransmission(P, S, 'at6'),

  // Привод — только FWD
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'IV (FB) (2016-2022)',
    slug: 'fb',
    yearStart: 2016,
    yearEnd: 2022,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-100',
      'engine:1.6-123g',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'III (QB) (2011-2017)',
    slug: 'qb',
    yearStart: 2011,
    yearEnd: 2017,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-107',
      'engine:1.6-123',
      'engine:1.6-138',
      'transmission:mt5',
      'transmission:mt6',
      'transmission:at4',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (JB) (2005-2011)',
    slug: 'jb',
    yearStart: 2005,
    yearEnd: 2011,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-97',
      'engine:1.6-112',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'I (DC) (2000-2005)',
    slug: 'dc',
    yearStart: 2000,
    yearEnd: 2005,
    bodyType: 'sedan' as BodyType,
    isActive: false,
    availableConfigs: [
      'engine:1.3-84',
      'engine:1.5-95',
      'engine:1.5-108',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:fwd',
    ],
  },
]

export const kiaRioSeed = {
  brand: {
    name: 'Kia',
    slug: 'kia',
    logo: 'M13.923 14.175c0 .046.015.072.041.072a.123.123 0 0 0 .058-.024l7.48-4.854a.72.72 0 0 1 .432-.13h1.644c.252 0 .422.168.422.42v3.139c0 .38-.084.6-.42.801l-1.994 1.2a.137.137 0 0 1-.067.024c-.024 0-.048-.019-.048-.088v-3.663c0-.043-.012-.071-.041-.071a.113.113 0 0 0-.058.024l-5.466 3.551a.733.733 0 0 1-.42.127h-3.624c-.254 0-.422-.168-.422-.422V9.757c0-.033-.015-.064-.044-.064a.118.118 0 0 0-.057.024L7.732 11.88c-.036.024-.046.041-.046.058 0 .014.008.029.032.055l2.577 2.575c.034.034.058.06.058.089 0 .024-.039.043-.084.043H7.94c-.183 0-.324-.026-.423-.125l-1.562-1.56a.067.067 0 0 0-.048-.024.103.103 0 0 0-.048.015l-2.61 1.57a.72.72 0 0 1-.423.122H.425C.168 14.7 0 14.53 0 14.279v-3.08c0-.38.084-.6.422-.8L2.43 9.192a.103.103 0 0 1 .052-.016c.032 0 .048.03.048.1V13.4c0 .043.01.063.041.063a.144.144 0 0 0 .06-.024L9.407 9.36a.733.733 0 0 1 .446-.124h3.648c.252 0 .422.168.422.42l-.002 4.518z',
    sortOrder: 5,
  },

  model: {
    name: 'Rio',
    slug: 'rio',
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
