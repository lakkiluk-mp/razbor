import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, fuelPumpHP, injectorsDiesel, transmission, ecuTransmission, drivetrainFWD, turbo, intercooler } from './builders'

const P = 'citroen-c4'
const S = ['citroen c4', 'ситроен с4', 'ситроен c4', 'с4']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.6-109', 'TU5JP4', 109),
  starter(P, S, '1.6-109'),
  alternator(P, S, '1.6-109'),

  engine(P, S, '1.6-120', 'EP6C', 120),
  starter(P, S, '1.6-120'),
  alternator(P, S, '1.6-120'),

  engine(P, S, '1.6-116', 'EC5', 116),
  starter(P, S, '1.6-116'),
  alternator(P, S, '1.6-116'),

  engine(P, S, '1.6t-150', 'EP6DT', 150),
  starter(P, S, '1.6t-150'),
  alternator(P, S, '1.6t-150'),
  fuelPumpHP(P, S, '1.6t-150'),
  turbo(P, S, '1.6t-150', 'EP6DT'),
  intercooler(P, S, '1.6t-150'),

  engine(P, S, '1.6d-115', 'DV6C', 115),
  starter(P, S, '1.6d-115'),
  alternator(P, S, '1.6d-115'),
  fuelPumpHP(P, S, '1.6d-115'),
  injectorsDiesel(P, S, '1.6d-115'),
  turbo(P, S, '1.6d-115', 'DV6C'),
  intercooler(P, S, '1.6d-115'),

  engine(P, S, '1.2t-130', 'EB2ADTS', 130),
  starter(P, S, '1.2t-130'),
  alternator(P, S, '1.2t-130'),
  fuelPumpHP(P, S, '1.2t-130'),
  turbo(P, S, '1.2t-130', 'EB2ADTS'),
  intercooler(P, S, '1.2t-130'),

  transmission(P, S, 'mt', 'МКПП 5-ступ (BE4)', ['BE4']),
  transmission(P, S, 'at4', 'АКПП 4-ступ (AL4/DP0)', ['AL4']),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'at6', 'АКПП 6-ступ (Aisin AM6)', ['AM6']),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'amt', 'Робот (AMT/EGS)', ['EGS6C']),
  ecuTransmission(P, S, 'amt'),
  transmission(P, S, 'at8', 'АКПП 8-ступ (EAT8)', ['EAT8']),
  ecuTransmission(P, S, 'at8'),

  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (LC) (2004-2011)',
    slug: 'lc',
    yearStart: 2004,
    yearEnd: 2011,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-109',
      'engine:1.6-120',
      'transmission:mt',
      'transmission:at4',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (B7) Хэтчбек (2010-2018)',
    slug: 'b7',
    yearStart: 2010,
    yearEnd: 2018,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-109',
      'engine:1.6-120',
      'engine:1.6d-115',
      'transmission:mt',
      'transmission:at4',
      'transmission:amt',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (B7) Седан (2013-2024)',
    slug: 'sedan',
    yearStart: 2013,
    yearEnd: 2024,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-116',
      'engine:1.6-120',
      'engine:1.6t-150',
      'transmission:mt',
      'transmission:at4',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'III (C41) (2020-2024)',
    slug: 'c41',
    yearStart: 2020,
    yearEnd: 2024,
    bodyType: 'hatchback' as BodyType,
    isActive: false,
    availableConfigs: [
      'engine:1.2t-130',
      'transmission:at8',
      'drivetrain:fwd',
    ],
  },
]

export const citroenC4Seed = {
  brand: {
    name: 'Citroen',
    slug: 'citroen',
    logo: 'M12 1.5L3 10.5L5.5 10.5L12 5L18.5 10.5L21 10.5ZM12 12L3 21L5.5 21L12 15.5L18.5 21L21 21Z',
    sortOrder: 30,
  },

  model: {
    name: 'C4',
    slug: 'c4',
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
