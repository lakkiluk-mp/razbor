import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainRWD, drivetrainAWD, fuelPumpHP, turbo, supercharger } from './builders'

const P = 'mercedes-c-class'
const S = ['c class', 'с класс', 'c-class']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.5-204', 'M254', 204, ['254915']),
  fuelPumpHP(P, S, '1.5-204'),
  turbo(P, S, '1.5-204', 'M254'),
  engine(P, S, '2.0-258', 'M254', 258, ['254920']),
  fuelPumpHP(P, S, '2.0-258'),
  turbo(P, S, '2.0-258', 'M254'),
  engine(P, S, '1.6-156', 'M274', 156, ['274910']),
  fuelPumpHP(P, S, '1.6-156'),
  turbo(P, S, '1.6-156', 'M274'),
  engine(P, S, '2.0-184', 'M274', 184, ['274920']),
  fuelPumpHP(P, S, '2.0-184'),
  turbo(P, S, '2.0-184', 'M274'),
  engine(P, S, '2.0-204', 'M264', 204, ['264920']),
  fuelPumpHP(P, S, '2.0-204'),
  turbo(P, S, '2.0-204', 'M264'),
  engine(P, S, '2.0-249', 'M264', 249, ['264920']),
  fuelPumpHP(P, S, '2.0-249'),
  turbo(P, S, '2.0-249', 'M264'),
  engine(P, S, '3.0-367', 'M276', 367, ['276823']),
  fuelPumpHP(P, S, '3.0-367'),
  turbo(P, S, '3.0-367', 'M276', undefined, 'left'),
  turbo(P, S, '3.0-367', 'M276', undefined, 'right'),
  engine(P, S, '4.0-510', 'M177', 510, ['177980']),
  fuelPumpHP(P, S, '4.0-510'),
  turbo(P, S, '4.0-510', 'M177', undefined, 'left'),
  turbo(P, S, '4.0-510', 'M177', undefined, 'right'),
  engine(P, S, '1.8-156', 'M271', 156, ['271910']),
  supercharger(P, S, '1.8-156', 'M271'),
  engine(P, S, '1.8-184', 'M271', 184, ['271820']),
  fuelPumpHP(P, S, '1.8-184'),
  supercharger(P, S, '1.8-184', 'M271'),
  engine(P, S, '1.8-204', 'M271', 204, ['271860']),
  fuelPumpHP(P, S, '1.8-204'),
  supercharger(P, S, '1.8-204', 'M271'),
  engine(P, S, '2.5-204', 'M272', 204, ['272922']),
  engine(P, S, '3.0-231', 'M272', 231, ['272947']),
  engine(P, S, '3.5-272', 'M272', 272, ['272948']),
  engine(P, S, '6.2-457', 'M156', 457, ['156985']),
  engine(P, S, '1.8-143', 'M271', 143, ['271946']),
  supercharger(P, S, '1.8-143', 'M271'),
  engine(P, S, '1.8-163', 'M271', 163, ['271948']),
  supercharger(P, S, '1.8-163', 'M271'),
  engine(P, S, '2.6-170', 'M112', 170, ['112912']),
  engine(P, S, '3.2-218', 'M112', 218, ['112946']),
  engine(P, S, '1.8-129', 'M111', 129, ['111920']),
  engine(P, S, '2.0-136', 'M111', 136, ['111945']),
  engine(P, S, '2.4-170', 'M112', 170, ['112910']),
  transmission(P, S, 'mt5', 'МКПП 5-ступ', ['716.5']),
  transmission(P, S, 'mt6', 'МКПП 6-ступ', ['716.6']),
  transmission(P, S, 'at5', 'АКПП 5-ступ', ['722.6']),
  transmission(P, S, 'at7', 'АКПП 7-ступ', ['722.9']),
  transmission(P, S, 'at9', 'АКПП 9-ступ', ['725.0']),
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
    logo: 'M17.58,1.35C15.9,0.48,14.01,0,12,0c-2.01,0-3.9,0.48-5.58,1.35v0C2.61,3.36,0,7.38,0,12c0,4.62,2.61,8.64,6.45,10.65C8.1,23.49,9.99,24,12,24c2.01,0,3.87-0.51,5.55-1.38C21.39,20.64,24,16.62,24,12C24,7.38,21.39,3.36,17.58,1.35z M1.2,12c0-3.93,2.1-7.35,5.25-9.27v0C7.98,1.8,9.75,1.26,11.7,1.2l-1.35,9.81L6.45,14.04v0L2.49,17.13C1.68,15.6,1.2,13.86,1.2,12z M17.58,21.24C15.93,22.23,14.04,22.8,12,22.8c-2.04,0-3.96-0.57-5.58-1.56c-1.47-0.87-2.67-2.07-3.57-3.51l3.57-1.47v0L12,13.98l5.58,2.25v0l3.6,1.47C20.28,19.17,19.02,20.37,17.58,21.24z M17.58,14.04L17.58,14.04l-3.87-3L12.33,1.2c1.89,0.06,3.69,0.6,5.22,1.53v0C20.7,4.62,22.8,8.07,22.8,12c0,1.86-0.45,3.6-1.29,5.13L17.58,14.04z',
    sortOrder: 3,
  },

  model: {
    name: 'C-Class',
    slug: 'c-class',
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
