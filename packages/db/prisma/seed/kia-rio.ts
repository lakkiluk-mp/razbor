import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainFWD } from './builders'

const P = 'kia-rio'
const S = ['kia rio', 'киа рио', 'рио']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // DC engines (1 поколение, 2000-2005)
  engine(P, S, '1.3-84', 'A3E', 84),
  engine(P, S, '1.5-95', 'A5E', 95),
  engine(P, S, '1.5-108', 'A5D', 108),

  // JB engine (2 поколение, 2005-2011)
  engine(P, S, '1.4-97', 'G4EE', 97),

  // QB engines (3 поколение, 2011-2017)
  engine(P, S, '1.4-107', 'G4FA', 107),
  engine(P, S, '1.6-123', 'G4FC', 123),

  // FB engines (4 поколение, 2016-2022)
  engine(P, S, '1.4-100', 'G4LC', 100),
  engine(P, S, '1.6-1230', 'G4FG', 123),

  // КПП
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at4', 'АКПП 4-ступ'),
  transmission(P, S, 'at6', 'АКПП 6-ступ'),

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
      'engine:1.6-1230',
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
    logo: null,
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
