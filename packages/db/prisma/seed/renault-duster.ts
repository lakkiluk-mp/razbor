import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, fuelPumpHP, injectorsDiesel, transmission, ecuTransmission, drivetrainFWD, drivetrainAWD, turbo, intercooler } from './builders'

const P = 'renault-duster'
const S = ['renault duster', 'рено дастер', 'дастер']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.6-k4m', 'K4M', 102, ['8201315743', '6001549002']),
  starter(P, S, '1.6-k4m'),
  alternator(P, S, '1.6-k4m'),
  engine(P, S, '1.5-109', 'K9K', 109, ['100015299R']),
  starter(P, S, '1.5-109'),
  alternator(P, S, '1.5-109'),
  fuelPumpHP(P, S, '1.5-109'),
  injectorsDiesel(P, S, '1.5-109'),
  turbo(P, S, '1.5-109', 'K9K'),
  intercooler(P, S, '1.5-109'),
  engine(P, S, '1.6-113', 'H4M', 113, ['8201583992']),
  starter(P, S, '1.6-113'),
  alternator(P, S, '1.6-113'),
  engine(P, S, '2.0-143', 'F4R', 143, ['100017527R']),
  starter(P, S, '2.0-143'),
  alternator(P, S, '2.0-143'),
  engine(P, S, '1.3-149', 'H5Ht', 149, ['100011218R']),
  starter(P, S, '1.3-149'),
  alternator(P, S, '1.3-149'),
  fuelPumpHP(P, S, '1.3-149'),
  turbo(P, S, '1.3-149', 'H5Ht'),
  intercooler(P, S, '1.3-149'),
  transmission(P, S, 'mt', 'МКПП 5-ступ', ['320100676R', '320103500R', '320103334R', '320109037R']),
  transmission(P, S, 'at', 'АКПП 4-ступ', ['8201114873']),
  ecuTransmission(P, S, 'at'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ TL8', ['320108363R']),
  transmission(P, S, 'cvt', 'Вариатор (CVT)', ['320107637R']),
  ecuTransmission(P, S, 'cvt'),
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (HS) (2010-2021)',
    slug: 'hs',
    yearStart: 2010,
    yearEnd: 2021,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-k4m',
      'engine:1.5-109',
      'engine:1.6-113',
      'engine:2.0-143',
      'transmission:mt',
      'transmission:mt6',
      'transmission:at',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (HM) (2020-2022)',
    slug: 'hm',
    yearStart: 2020,
    yearEnd: 2022,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.3-149',
      'engine:1.5-109',
      'engine:1.6-113',
      'engine:2.0-143',
      'transmission:mt',
      'transmission:mt6',
      'transmission:cvt',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
]

export const renaultDusterSeed = {
  brand: {
    name: 'Renault',
    slug: 'renault',
    logo: 'M17.463 11.99l-4.097-7.692-.924 1.707 3.213 5.985-5.483 10.283L4.69 11.99 11.096 0H9.27L2.882 11.99 9.269 24h1.807zm3.655 0L14.711 0h-1.807L6.517 11.99l4.117 7.712.904-1.707-3.193-6.005 5.463-10.263L19.29 11.99 12.904 24h1.807Z',
    sortOrder: 4,
  },

  model: {
    name: 'Duster',
    slug: 'duster',
    isPopular: true,
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
