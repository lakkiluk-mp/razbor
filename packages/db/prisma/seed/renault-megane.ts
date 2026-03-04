import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, fuelPumpHP, injectorsDiesel, transmission, ecuTransmission, drivetrainFWD, turbo, intercooler } from './builders'

const P = 'renault-megane'
const S = ['renault megane', 'рено меган', 'меган']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // K4M 1.6 102hp — shared (Logan/Sandero/Duster)
  engine(P, S, '1.6-k4m', 'K4M', 102, ['8201315743', '6001549002']),
  starter(P, S, '1.6-k4m'),
  alternator(P, S, '1.6-k4m'),

  // H4M 1.6 113hp — shared (Logan/Sandero/Duster/Vesta/Qashqai)
  engine(P, S, '1.6-113', 'H4M', 113, ['8201583992']),
  starter(P, S, '1.6-113'),
  alternator(P, S, '1.6-113'),

  // F4R 2.0 135hp — model-specific (Megane II)
  engine(P, S, '2.0-135', 'F4R', 135),
  starter(P, S, '2.0-135'),
  alternator(P, S, '2.0-135'),

  // M4R 2.0 140hp — model-specific (Megane III)
  engine(P, S, '2.0-140', 'M4R', 140),
  starter(P, S, '2.0-140'),
  alternator(P, S, '2.0-140'),

  // F4R 2.0 137hp — model-specific (Megane III рестайл)
  engine(P, S, '2.0-137', 'F4R', 137),
  starter(P, S, '2.0-137'),
  alternator(P, S, '2.0-137'),

  // K9K 1.5 106hp — дизель (Megane III)
  engine(P, S, '1.5-106', 'K9K', 106),
  starter(P, S, '1.5-106'),
  alternator(P, S, '1.5-106'),
  fuelPumpHP(P, S, '1.5-106'),
  injectorsDiesel(P, S, '1.5-106'),
  turbo(P, S, '1.5-106', 'K9K'),
  intercooler(P, S, '1.5-106'),

  // H5Ht 1.3 140hp — бензин турбо TCe (Megane IV)
  engine(P, S, '1.3-140', 'H5Ht', 140),
  starter(P, S, '1.3-140'),
  alternator(P, S, '1.3-140'),
  fuelPumpHP(P, S, '1.3-140'),
  turbo(P, S, '1.3-140', 'H5Ht'),
  intercooler(P, S, '1.3-140'),

  // K9K 1.5 110hp — дизель (Megane IV)
  engine(P, S, '1.5-110', 'K9K', 110),
  starter(P, S, '1.5-110'),
  alternator(P, S, '1.5-110'),
  fuelPumpHP(P, S, '1.5-110'),
  injectorsDiesel(P, S, '1.5-110'),
  turbo(P, S, '1.5-110', 'K9K'),
  intercooler(P, S, '1.5-110'),

  // КПП
  transmission(P, S, 'mt', 'МКПП 5-ступ (JR5)'),
  transmission(P, S, 'at', 'АКПП 4-ступ (DP0/AL4)'),
  ecuTransmission(P, S, 'at'),
  transmission(P, S, 'cvt', 'Вариатор (CVT)'),
  ecuTransmission(P, S, 'cvt'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'robot', 'EDC робот 7-ступ'),
  ecuTransmission(P, S, 'robot'),

  // Привод — только FWD
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'II (BM) (2002-2009)',
    slug: 'bm',
    yearStart: 2002,
    yearEnd: 2009,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-k4m',
      'engine:2.0-135',
      'transmission:mt',
      'transmission:at',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'III (DZ) (2008-2016)',
    slug: 'dz',
    yearStart: 2008,
    yearEnd: 2016,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-k4m',
      'engine:1.6-113',
      'engine:2.0-140',
      'engine:2.0-137',
      'engine:1.5-106',
      'transmission:mt',
      'transmission:at',
      'transmission:cvt',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'IV (BFB) (2015-2020)',
    slug: 'bfb',
    yearStart: 2015,
    yearEnd: 2020,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.3-140',
      'engine:1.5-110',
      'transmission:mt6',
      'transmission:robot',
      'drivetrain:fwd',
    ],
  },
]

export const renaultMeganeSeed = {
  brand: {
    name: 'Renault',
    slug: 'renault',
    logo: 'M17.463 11.99l-4.097-7.692-.924 1.707 3.213 5.985-5.483 10.283L4.69 11.99 11.096 0H9.27L2.882 11.99 9.269 24h1.807zm3.655 0L14.711 0h-1.807L6.517 11.99l4.117 7.712.904-1.707-3.193-6.005 5.463-10.263L19.29 11.99 12.904 24h1.807Z',
    sortOrder: 4,
  },

  model: {
    name: 'Megane',
    slug: 'megane',
    isPopular: false,
    sortOrder: 3,
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
