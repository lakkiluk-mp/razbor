import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainFWD } from './builders'

const P = 'renault-logan'
const S = ['renault logan', 'рено логан', 'логан']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.4-75', 'K7J', 75, ['6001549085']),
  starter(P, S, '1.4-75'),
  alternator(P, S, '1.4-75'),
  engine(P, S, '1.6-k7m', 'K7M', 82, ['8201109282', '100015193R']),
  starter(P, S, '1.6-k7m'),
  alternator(P, S, '1.6-k7m'),
  engine(P, S, '1.6-k4m', 'K4M', 102, ['8201315743', '6001549002']),
  starter(P, S, '1.6-k4m'),
  alternator(P, S, '1.6-k4m'),
  engine(P, S, '1.6-113', 'H4M', 113, ['8201583992']),
  starter(P, S, '1.6-113'),
  alternator(P, S, '1.6-113'),
  transmission(P, S, 'mt', 'МКПП 5-ступ', ['320100676R', '320103500R', '320103334R']),
  transmission(P, S, 'at', 'АКПП 4-ступ', ['8201114873']),
  ecuTransmission(P, S, 'at'),
  transmission(P, S, 'amt', 'АМТ (робот)'),
  ecuTransmission(P, S, 'amt'),
  // Привод — только FWD
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'II (L52) (2014-2022)',
    slug: 'l52',
    yearStart: 2014,
    yearEnd: 2022,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-k7m',
      'engine:1.6-k4m',
      'engine:1.6-113',
      'transmission:mt',
      'transmission:at',
      'transmission:amt',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'I (L90) (2004-2016)',
    slug: 'l90',
    yearStart: 2004,
    yearEnd: 2016,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-75',
      'engine:1.6-k7m',
      'engine:1.6-k4m',
      'transmission:mt',
      'transmission:at',
      'drivetrain:fwd',
    ],
  },
]

export const renaultLoganSeed = {
  brand: {
    name: 'Renault',
    slug: 'renault',
    logo: 'M17.463 11.99l-4.097-7.692-.924 1.707 3.213 5.985-5.483 10.283L4.69 11.99 11.096 0H9.27L2.882 11.99 9.269 24h1.807zm3.655 0L14.711 0h-1.807L6.517 11.99l4.117 7.712.904-1.707-3.193-6.005 5.463-10.263L19.29 11.99 12.904 24h1.807Z',
    sortOrder: 4,
  },

  model: {
    name: 'Logan',
    slug: 'logan',
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
