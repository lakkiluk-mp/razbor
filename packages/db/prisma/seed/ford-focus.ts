import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, fuelPumpHP, injectorsDiesel, transmission, drivetrainFWD } from './builders'

const P = 'ford-focus'
const S = ['ford focus', 'форд фокус', 'фокус']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.6-100z', 'FYDA', 100),
  engine(P, S, '1.8-115', 'EYDB', 115),
  engine(P, S, '2.0-130', 'EDDB', 130),

  engine(P, S, '1.4-80', 'ASDA', 80),
  engine(P, S, '1.6-100', 'SHDA', 100),
  engine(P, S, '1.6-115', 'HXDA', 115),
  engine(P, S, '1.8-125', 'QQDB', 125),
  engine(P, S, '1.8d-115', 'KKDA', 115),
  fuelPumpHP(P, S, '1.8d-115'),
  injectorsDiesel(P, S, '1.8d-115'),
  engine(P, S, '2.0-145', 'AODA', 145),

  engine(P, S, '1.6-85', 'XTDA', 85),
  engine(P, S, '1.6-105', 'IQDA', 105),
  engine(P, S, '1.6-125', 'PNDA', 125),
  engine(P, S, '1.5t-150', 'M8DA', 150),
  fuelPumpHP(P, S, '1.5t-150'),
  engine(P, S, '2.0-150', 'XQDA', 150),
  fuelPumpHP(P, S, '2.0-150'),
  engine(P, S, '2.0d-140', 'UFDB', 140),
  fuelPumpHP(P, S, '2.0d-140'),
  injectorsDiesel(P, S, '2.0d-140'),

  transmission(P, S, 'mt5', 'МКПП 5-ступ (IB5)'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ (MMT6)'),
  transmission(P, S, 'at4', 'АКПП 4-ступ (4F27E)'),
  transmission(P, S, 'amt', 'PowerShift 6-ступ (DPS6)'),
  transmission(P, S, 'at6', 'АКПП 6-ступ (6F35)'),

  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'III (CB8) (2010-2019)',
    slug: 'cb8',
    yearStart: 2010,
    yearEnd: 2019,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-85',
      'engine:1.6-105',
      'engine:1.6-125',
      'engine:1.5t-150',
      'engine:2.0-150',
      'engine:2.0d-140',
      'transmission:mt5',
      'transmission:mt6',
      'transmission:amt',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (CB4) (2004-2011)',
    slug: 'cb4',
    yearStart: 2004,
    yearEnd: 2011,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-80',
      'engine:1.6-100',
      'engine:1.6-115',
      'engine:1.8-125',
      'engine:1.8d-115',
      'engine:2.0-145',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'I (DFW) (1998-2007)',
    slug: 'dfw',
    yearStart: 1998,
    yearEnd: 2007,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-100z',
      'engine:1.8-115',
      'engine:2.0-130',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:fwd',
    ],
  },
]

export const fordFocusSeed = {
  brand: {
    name: 'Ford',
    slug: 'ford',
    logo: null,
    sortOrder: 6,
  },

  model: {
    name: 'Focus',
    slug: 'focus',
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
