import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainFWD } from './builders'

const P = 'hyundai-solaris'
const S = ['hyundai solaris', 'хёндай солярис', 'хендай солярис', 'солярис']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // Gen 1 (RB) engines
  engine(P, S, '1.4-107', 'G4FA', 107, ['211012BW01']),
  engine(P, S, '1.6-123', 'G4FC', 123, ['211012BW02']),

  // Gen 2 (HCr) engines
  engine(P, S, '1.4-100', 'G4LC', 100),
  engine(P, S, '1.6-123g', 'G4FG', 123),

  // КПП
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'at4', 'АКПП 4-ступ', ['4500023160']),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at6', 'АКПП 6-ступ', ['4500002F730']),

  // Привод — только FWD
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (RB) (2010-2017)',
    slug: 'rb',
    yearStart: 2010,
    yearEnd: 2017,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-107',
      'engine:1.6-123',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (HCr) (2017-2022)',
    slug: 'hcr',
    yearStart: 2017,
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
]

export const hyundaiSolarisSeed = {
  brand: {
    name: 'Hyundai',
    slug: 'hyundai',
    logo: null,
    sortOrder: 8,
  },

  model: {
    name: 'Solaris',
    slug: 'solaris',
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
