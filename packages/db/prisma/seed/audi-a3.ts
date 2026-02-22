import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainFWD, drivetrainAWD, fuelPumpHP, injectorsDiesel, turbo, intercooler } from './builders'

const P = 'audi-a3'
const S = ['a3', 'а3', 'a 3']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === 8V Petrol engines ===
  engine(P, S, '1.4-125', 'CZCA', 125, ['04E100033B']),
  starter(P, S, '1.4-125'),
  alternator(P, S, '1.4-125'),
  fuelPumpHP(P, S, '1.4-125'),
  turbo(P, S, '1.4-125', 'CZCA'),
  intercooler(P, S, '1.4-125'),

  engine(P, S, '1.4-150', 'CZEA', 150, ['04E100034F']),
  starter(P, S, '1.4-150'),
  alternator(P, S, '1.4-150'),
  fuelPumpHP(P, S, '1.4-150'),
  turbo(P, S, '1.4-150', 'CZEA'),
  intercooler(P, S, '1.4-150'),

  engine(P, S, '1.8-180', 'CJSA', 180, ['06K100033B']),
  starter(P, S, '1.8-180'),
  alternator(P, S, '1.8-180'),
  fuelPumpHP(P, S, '1.8-180'),
  turbo(P, S, '1.8-180', 'CJSA'),
  intercooler(P, S, '1.8-180'),

  engine(P, S, '2.0-190', 'CZPB', 190, ['06K100034B']),
  starter(P, S, '2.0-190'),
  alternator(P, S, '2.0-190'),
  fuelPumpHP(P, S, '2.0-190'),
  turbo(P, S, '2.0-190', 'CZPB'),
  intercooler(P, S, '2.0-190'),

  // === 8V Diesel engine ===
  engine(P, S, '2.0d-150', 'CRBC', 150, ['04L100090A']),
  starter(P, S, '2.0d-150'),
  alternator(P, S, '2.0d-150'),
  fuelPumpHP(P, S, '2.0d-150'),
  injectorsDiesel(P, S, '2.0d-150'),
  turbo(P, S, '2.0d-150', 'CRBC'),
  intercooler(P, S, '2.0d-150'),

  // === Transmissions ===
  transmission(P, S, 'mt6', 'МКПП 6-ступ MQ250'),
  transmission(P, S, 'dsg7', 'DSG-7 DQ200 (робот)', ['0AM300048']),
  ecuTransmission(P, S, 'dsg7'),
  transmission(P, S, 'dsg6', 'DSG-6 DQ250 (робот)', ['02E300043']),
  ecuTransmission(P, S, 'dsg6'),
  transmission(P, S, 'dsg7w', 'S-tronic DQ381 (робот)', ['0GC300012']),
  ecuTransmission(P, S, 'dsg7w'),

  // === Drivetrain ===
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: '8V Sportback (2012-2020)',
    slug: '8v-sportback',
    yearStart: 2012,
    yearEnd: 2020,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-125', 'engine:1.4-150', 'engine:1.8-180', 'engine:2.0-190', 'engine:2.0d-150',
      'transmission:mt6', 'transmission:dsg7', 'transmission:dsg6',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: '8V Sedan (2013-2020)',
    slug: '8v-sedan',
    yearStart: 2013,
    yearEnd: 2020,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-125', 'engine:1.4-150', 'engine:1.8-180', 'engine:2.0-190', 'engine:2.0d-150',
      'transmission:mt6', 'transmission:dsg7', 'transmission:dsg6',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: '8Y Sedan (2020-2024)',
    slug: '8y-sedan',
    yearStart: 2020,
    yearEnd: 2024,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-150',
      'transmission:dsg7w',
      'drivetrain:fwd',
    ],
  },
  {
    name: '8Y Sportback (2020-2024)',
    slug: '8y-sportback',
    yearStart: 2020,
    yearEnd: 2024,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-150',
      'transmission:dsg7w',
      'drivetrain:fwd',
    ],
  },
]

export const audiA3Seed = {
  brand: {
    name: 'Audi',
    slug: 'audi',
    logo: 'M19.848,7.848c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928C1.859,7.848,0,9.707,0,12s1.859,4.152,4.152,4.152c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928C22.141,16.152,24,14.293,24,12S22.141,7.848,19.848,7.848z M17.232,13.866c-0.376-0.526-0.598-1.17-0.598-1.866c0-0.696,0.222-1.34,0.598-1.866c0.376,0.526,0.598,1.17,0.598,1.866C17.83,12.696,17.608,13.34,17.232,13.866z M12,13.866c-0.376-0.526-0.598-1.17-0.598-1.866c0-0.696,0.222-1.34,0.598-1.866c0.376,0.526,0.598,1.17,0.598,1.866C12.598,12.696,12.376,13.34,12,13.866z M6.768,13.866C6.392,13.34,6.17,12.696,6.17,12c0-0.696,0.222-1.34,0.598-1.866C7.144,10.66,7.366,11.304,7.366,12C7.366,12.696,7.144,13.34,6.768,13.866z M0.938,12c0-1.775,1.439-3.214,3.214-3.214c0.736,0,1.414,0.248,1.956,0.665C5.56,10.154,5.232,11.039,5.232,12c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C2.377,15.214,0.938,13.775,0.938,12z M7.428,14.549C7.976,13.846,8.304,12.961,8.304,12c0-0.961-0.328-1.846-0.876-2.549c0.542-0.416,1.22-0.665,1.956-0.665c0.736,0,1.414,0.248,1.956,0.665c-0.549,0.704-0.876,1.588-0.876,2.549c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C8.648,15.214,7.97,14.966,7.428,14.549z M12.66,14.549c0.549-0.704,0.876-1.588,0.876-2.549c0-0.961-0.328-1.846-0.876-2.55c0.542-0.416,1.22-0.665,1.956-0.665s1.414,0.248,1.956,0.665c-0.549,0.704-0.876,1.588-0.876,2.549c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C13.88,15.214,13.202,14.966,12.66,14.549z M19.848,15.214c-0.736,0-1.414-0.248-1.956-0.665c0.548-0.704,0.876-1.588,0.876-2.549c0-0.961-0.328-1.846-0.876-2.549c0.542-0.416,1.22-0.665,1.956-0.665c1.775,0,3.214,1.439,3.214,3.214S21.623,15.214,19.848,15.214z',
    sortOrder: 2,
  },

  model: {
    name: 'A3',
    slug: 'a3',
    isPopular: false,
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
