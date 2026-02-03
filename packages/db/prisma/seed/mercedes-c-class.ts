import { BodyType } from '@prisma/client'
import type { PartData, GenerationData } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainRWD, drivetrainAWD } from './builders'

const P = 'mercedes-c-class'
const S = ['c class', 'с класс', 'c-class']

const modelSpecificParts: PartData[] = [
  engine(P, S, '1.5-204', 'M254', 204),
  engine(P, S, '2.0-258', 'M254', 258),
  engine(P, S, '1.6-156', 'M274', 156),
  engine(P, S, '2.0-184', 'M274', 184),
  engine(P, S, '2.0-204', 'M264', 204),
  engine(P, S, '2.0-249', 'M264', 249),
  engine(P, S, '3.0-367', 'M276', 367),
  engine(P, S, '4.0-510', 'M177', 510),
  engine(P, S, '1.8-156', 'M271', 156),
  engine(P, S, '1.8-184', 'M271', 184),
  engine(P, S, '1.8-204', 'M271', 204),
  engine(P, S, '2.5-204', 'M272', 204),
  engine(P, S, '3.0-231', 'M272', 231),
  engine(P, S, '3.5-272', 'M272', 272),
  engine(P, S, '6.2-457', 'M156', 457),
  engine(P, S, '1.8-143', 'M271', 143),
  engine(P, S, '1.8-163', 'M271', 163),
  engine(P, S, '2.6-170', 'M112', 170),
  engine(P, S, '3.2-218', 'M112', 218),
  engine(P, S, '1.8-129', 'M111', 129),
  engine(P, S, '2.0-136', 'M111', 136),
  engine(P, S, '2.4-170', 'M112', 170),
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at5', 'АКПП 5-ступ'),
  transmission(P, S, 'at7', 'АКПП 7-ступ'),
  transmission(P, S, 'at9', 'АКПП 9-ступ'),
  ...drivetrainRWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'V (W206/S206) (2021-н.в.)',
    slug: 'w206',
    yearStart: 2021,
    yearEnd: null,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.5-204',
      'engine:2.0-258',
      'transmission:at9',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'IV (W205/S205/C205/A205) (2013-2022)',
    slug: 'w205',
    yearStart: 2013,
    yearEnd: 2022,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-156',
      'engine:2.0-184',
      'engine:2.0-204',
      'engine:2.0-249',
      'engine:3.0-367',
      'engine:4.0-510',
      'transmission:at9',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'III (W204/S204/C204) (2007-2014)',
    slug: 'w204',
    yearStart: 2007,
    yearEnd: 2014,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-156',
      'engine:1.8-156',
      'engine:1.8-184',
      'engine:1.8-204',
      'engine:2.5-204',
      'engine:3.0-231',
      'engine:3.5-272',
      'engine:6.2-457',
      'transmission:mt6',
      'transmission:at7',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (W203/S203/C203/CL203) (2000-2008)',
    slug: 'w203',
    yearStart: 2000,
    yearEnd: 2008,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-143',
      'engine:1.8-163',
      'engine:2.6-170',
      'engine:3.2-218',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'I (W202/S202) (1993-2001)',
    slug: 'w202',
    yearStart: 1993,
    yearEnd: 2001,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-129',
      'engine:2.0-136',
      'engine:2.4-170',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:rwd',
    ],
  },
]

export const mercedesCClassSeed = {
  brand: {
    name: 'Mercedes-Benz',
    slug: 'mercedes-benz',
    logo: null,
    sortOrder: 3,
  },

  model: {
    name: 'C-Class',
    slug: 'c-class',
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
