import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, fuelPumpHP, transmission, ecuTransmission, drivetrainFWD, turbo, intercooler } from './builders'

const P = 'skoda-rapid'
const S = ['skoda rapid', 'шкода рапид', 'рапид', 'rapid']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // EA111 engines (Gen 1 only)
  engine(P, S, '1.2-75', 'CGPC', 75, ['03E100033R']),
  starter(P, S, '1.2-75'),
  alternator(P, S, '1.2-75'),
  engine(P, S, '1.4-122', 'CAXA', 122, ['03C100038P']),
  starter(P, S, '1.4-122'),
  alternator(P, S, '1.4-122'),
  fuelPumpHP(P, S, '1.4-122'),
  turbo(P, S, '1.4-122', 'CAXA'),
  intercooler(P, S, '1.4-122'),
  engine(P, S, '1.6-105', 'CFNA', 105, ['03C100038F']),
  starter(P, S, '1.6-105'),
  alternator(P, S, '1.6-105'),

  engine(P, S, '1.4-125', 'CZCA', 125, ['04E100033B']),
  starter(P, S, '1.4-125'),
  alternator(P, S, '1.4-125'),
  fuelPumpHP(P, S, '1.4-125'),
  turbo(P, S, '1.4-125', 'CZCA'),
  intercooler(P, S, '1.4-125'),
  engine(P, S, '1.6-90', 'CFW', 90),
  starter(P, S, '1.6-90'),
  alternator(P, S, '1.6-90'),
  engine(P, S, '1.6-110', 'CWVA', 110, ['04E100037C']),
  starter(P, S, '1.6-110'),
  alternator(P, S, '1.6-110'),

  // КПП
  transmission(P, S, 'mt5', 'МКПП 5-ступ MQ200', ['02T300046R']),
  transmission(P, S, 'mt6', 'МКПП 6-ступ MQ200'),
  transmission(P, S, 'at6', 'АКПП 6-ступ (Aisin 09G)', ['09G300034']),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'dsg', 'DSG-7 DQ200 (робот)', ['0AM300048']),
  ecuTransmission(P, S, 'dsg'),

  // Привод — только FWD
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (NH3) (2012-2020)',
    slug: 'nh3',
    yearStart: 2012,
    yearEnd: 2020,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.2-75', 'engine:1.4-122', 'engine:1.4-125',
      'engine:1.6-90', 'engine:1.6-105', 'engine:1.6-110',
      'transmission:mt5', 'transmission:mt6', 'transmission:at6', 'transmission:dsg',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (2020-2023)',
    slug: 'rapid2',
    yearStart: 2020,
    yearEnd: 2023,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-90', 'engine:1.6-110', 'engine:1.4-125',
      'transmission:mt5', 'transmission:mt6', 'transmission:at6', 'transmission:dsg',
      'drivetrain:fwd',
    ],
  },
]

export const skodaRapidSeed = {
  brand: {
    name: 'Skoda',
    slug: 'skoda',
    logo: 'M12 0C5.3726 0 0 5.3726 0 12s5.3726 12 12 12 12-5.3726 12-12S18.6274 0 12 0Zm0 22.9636C5.945 22.9636 1.0364 18.055 1.0364 12 1.0364 5.945 5.945 1.0364 12 1.0364S22.9636 5.945 22.9636 12 18.055 22.9636 12 22.9636Zm5.189-7.2325-.269.7263h-.984c.263-.7089 3.5783-8.6177-2.9362-13.9819a9.5254 9.5254 0 0 0-4.0531.4483c.2172.175 2.474 2.0276 3.5373 4.315l-.312.084c-.5861-.6387-2.7156-2.9833-4.7448-3.7379a9.6184 9.6184 0 0 0-2.8448 2.3597c.953.4875 3.4432 1.9748 4.3896 3.1302-.0542.0244-.267.139-.267.139-1.736-1.3195-4.8199-2.0043-4.9775-2.0383a9.5126 9.5126 0 0 0-1.2267 3.6098c4.7759.9613 6.0618 3.1715 6.2818 5.6721H7.878l-1.5545-.6776a.8563.8563 0 0 0-.2524-.0531H3.1767a9.587 9.587 0 0 0 1.9267 2.9155h1.2334c.1063 0 .1993-.0133.2923-.0664l1.2489-.6378h9.042l.269.7264a4.8386 4.8386 0 0 0 2.9466-1.4667 4.839 4.839 0 0 0-2.9467-1.4666zm-4.14-.5786a1.1863 1.1863 0 0 1-.5038-1.2162 1.1862 1.1862 0 0 1 .931-.9309 1.1863 1.1863 0 0 1 1.2161.5038c.3098.4636.2563 1.0924-.1473 1.496-.4032.4032-1.0318.4574-1.496.1473z',
    sortOrder: 9,
  },

  model: {
    name: 'Rapid',
    slug: 'rapid',
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
