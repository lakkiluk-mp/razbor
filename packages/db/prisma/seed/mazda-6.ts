import { BodyType } from '@prisma/client'
import type { PartData, GenerationData } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainFWD } from './builders'

const P = 'mazda-6'
const S = ['mazda 6', 'мазда 6']

const modelSpecificParts: PartData[] = [
  engine(P, S, '1.8-120', 'L8', 120),
  engine(P, S, '2.0-141', 'LF', 141),
  engine(P, S, '2.0-147', 'LF', 147),
  engine(P, S, '2.3-166', 'L3', 166),
  engine(P, S, '2.5-170', 'L5', 170),
  engine(P, S, '2.0-150', 'SKYACTIV-G', 150),
  engine(P, S, '2.5-192', 'SKYACTIV-G', 192),
  engine(P, S, '2.5t-231', 'Turbo SKYACTIV-G', 231),
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at5', 'АКПП 5-ступ'),
  transmission(P, S, 'at6', 'АКПП 6-ступ'),
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'III Рестайлинг 2 (GJ) (2017-2022)',
    slug: 'gj-2017',
    yearStart: 2017,
    yearEnd: 2022,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150',
      'engine:2.5-192',
      'engine:2.5t-231',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'III Рестайлинг (GJ) (2015-2018)',
    slug: 'gj-2015',
    yearStart: 2015,
    yearEnd: 2018,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150',
      'engine:2.5-192',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'III (GJ) (2012-2015)',
    slug: 'gj-2012',
    yearStart: 2012,
    yearEnd: 2015,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150',
      'engine:2.5-192',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II Рестайлинг (GH) седан (2010-2012)',
    slug: 'gh-2010-sedan',
    yearStart: 2010,
    yearEnd: 2012,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-120',
      'engine:2.0-147',
      'engine:2.5-170',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (GH) седан (2007-2010)',
    slug: 'gh-2007-sedan',
    yearStart: 2007,
    yearEnd: 2010,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-120',
      'engine:2.0-147',
      'engine:2.5-170',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (GH) лифтбек (2007-2010)',
    slug: 'gh-2007-liftback',
    yearStart: 2007,
    yearEnd: 2010,
    bodyType: 'liftback' as BodyType,
    isActive: false,
    availableConfigs: [
      'engine:1.8-120',
      'engine:2.0-147',
      'engine:2.5-170',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'I Рестайлинг (GG) седан (2005-2008)',
    slug: 'gg-2005-sedan',
    yearStart: 2005,
    yearEnd: 2008,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-120',
      'engine:2.0-147',
      'engine:2.3-166',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'I (GG) седан (2002-2005)',
    slug: 'gg-2002-sedan',
    yearStart: 2002,
    yearEnd: 2005,
    bodyType: 'sedan' as BodyType,
    isActive: false,
    availableConfigs: [
      'engine:1.8-120',
      'engine:2.0-141',
      'engine:2.3-166',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:fwd',
    ],
  },
]

export const mazda6Seed = {
  brand: {
    name: 'Mazda',
    slug: 'mazda',
    logo: null,
    sortOrder: 1,
  },

  model: {
    name: 'Mazda6',
    slug: 'mazda6',
    isPopular: true,
    sortOrder: 1,
  },

  generations,

  getPartsForGeneration(generation: GenerationData): PartData[] {
    const allParts = [...getBaseParts(P, S), ...modelSpecificParts]

    return allParts.filter((part) => {
      if (!part.configGroup) return true
      if (!generation.availableConfigs) return true
      return generation.availableConfigs.includes(part.configGroup)
    })
  },
}
