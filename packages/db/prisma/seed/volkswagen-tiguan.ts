import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import {
  engine,
  starter,
  alternator,
  fuelPumpHP,
  injectorsDiesel,
  transmission,
  ecuTransmission,
  drivetrainFWD,
  drivetrainAWD,
  turbo,
  intercooler,
} from './builders'

const P = 'volkswagen-tiguan'
const S = ['volkswagen tiguan', 'фольксваген тигуан', 'тигуан', 'tiguan', 'vw tiguan']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === NF (5N) engines ===

  // 1.4 TSI 150hp CTHA — Tiguan-specific (не в shared)
  engine(P, S, '1.4t-150', 'CTHA', 150, ['03C100092E']),
  starter(P, S, '1.4t-150'),
  alternator(P, S, '1.4t-150'),
  fuelPumpHP(P, S, '1.4t-150'),
  turbo(P, S, '1.4t-150', 'CTHA'),
  intercooler(P, S, '1.4t-150'),

  // 1.4 TSI 122hp CAXA — shared
  engine(P, S, '1.4-122', 'CAXA', 122, ['03C100038P']),
  starter(P, S, '1.4-122'),
  alternator(P, S, '1.4-122'),
  fuelPumpHP(P, S, '1.4-122'),
  turbo(P, S, '1.4-122', 'CAXA'),
  intercooler(P, S, '1.4-122'),

  // 2.0 TSI 170hp CAWA — Tiguan-specific (не в shared)
  engine(P, S, '2.0-170', 'CAWA', 170),
  starter(P, S, '2.0-170'),
  alternator(P, S, '2.0-170'),
  fuelPumpHP(P, S, '2.0-170'),
  turbo(P, S, '2.0-170', 'CAWA'),
  intercooler(P, S, '2.0-170'),

  // 2.0 TSI 200hp CAWB — shared (добавлен в shared-parts)
  engine(P, S, '2.0-200', 'CAWB', 200, ['06J100033S']),
  starter(P, S, '2.0-200'),
  alternator(P, S, '2.0-200'),
  fuelPumpHP(P, S, '2.0-200'),
  turbo(P, S, '2.0-200', 'CAWB'),
  intercooler(P, S, '2.0-200'),

  // 2.0 TDI 170hp CBBB — дизель NF
  engine(P, S, '2.0d-170', 'CBBB', 170, ['03L100090D']),
  starter(P, S, '2.0d-170'),
  alternator(P, S, '2.0d-170'),
  fuelPumpHP(P, S, '2.0d-170'),
  injectorsDiesel(P, S, '2.0d-170'),
  turbo(P, S, '2.0d-170', 'CBBB'),
  intercooler(P, S, '2.0d-170'),

  // === AD1 engines ===

  // 1.4 TSI 125hp CZCA — shared
  engine(P, S, '1.4-125', 'CZCA', 125, ['04E100033B']),
  starter(P, S, '1.4-125'),
  alternator(P, S, '1.4-125'),
  fuelPumpHP(P, S, '1.4-125'),
  turbo(P, S, '1.4-125', 'CZCA'),
  intercooler(P, S, '1.4-125'),

  // 1.4 TSI 150hp CZEA (alias CZDA) — shared
  engine(P, S, '1.4-150', 'CZEA', 150, ['04E100034F']),
  starter(P, S, '1.4-150'),
  alternator(P, S, '1.4-150'),
  fuelPumpHP(P, S, '1.4-150'),
  turbo(P, S, '1.4-150', 'CZEA'),
  intercooler(P, S, '1.4-150'),

  // 2.0 TSI 180hp CZPA — Tiguan-specific (в Passat это 220hp с другим configGroup)
  engine(P, S, '2.0-180', 'CZPA', 180),
  starter(P, S, '2.0-180'),
  alternator(P, S, '2.0-180'),
  fuelPumpHP(P, S, '2.0-180'),
  turbo(P, S, '2.0-180', 'CZPA'),
  intercooler(P, S, '2.0-180'),

  // 2.0 TSI 220hp CHHB — Tiguan-specific (R-Line)
  engine(P, S, '2.0-220', 'CHHB', 220, ['06K100038S']),
  starter(P, S, '2.0-220'),
  alternator(P, S, '2.0-220'),
  fuelPumpHP(P, S, '2.0-220'),
  turbo(P, S, '2.0-220', 'CHHB'),
  intercooler(P, S, '2.0-220'),

  // 2.0 TDI 150hp DFGA — дизель AD1
  engine(P, S, '2.0d-150', 'DFGA', 150, ['04L100090R']),
  starter(P, S, '2.0d-150'),
  alternator(P, S, '2.0d-150'),
  fuelPumpHP(P, S, '2.0d-150'),
  injectorsDiesel(P, S, '2.0d-150'),
  turbo(P, S, '2.0d-150', 'DFGA'),
  intercooler(P, S, '2.0d-150'),

  // === Трансмиссии ===

  // МКПП 6-ступ (MQ250/MQ350) — обе генерации
  transmission(P, S, 'mt', 'МКПП 6-ступ'),

  // АКПП 6-ступ Aisin 09G — только NF (5N), 4Motion
  transmission(P, S, 'at6', 'АКПП 6-ступ Aisin 09G', ['09G300034']),
  ecuTransmission(P, S, 'at6'),

  // DSG-7 DQ200 (сухое сцепление) — NF рестайл + AD1 FWD 1.4
  transmission(P, S, 'dsg7', 'DSG-7 DQ200 (робот)', ['0AM300048']),
  ecuTransmission(P, S, 'dsg7'),

  // DSG-7 DQ381 (мокрое сцепление) — AD1, 2.0 TSI + 4Motion 1.4
  transmission(P, S, 'dsg7w', 'S-tronic DQ381 (робот)', ['0GC300012']),
  ecuTransmission(P, S, 'dsg7w'),

  // DSG-6 DQ250 (мокрое сцепление) — для дизелей TDI
  transmission(P, S, 'dsg6', 'DSG-6 DQ250 (робот)', ['02E300043']),
  ecuTransmission(P, S, 'dsg6'),

  // === Привод ===
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (5N) (2006-2017)',
    slug: '5n',
    yearStart: 2006,
    yearEnd: 2017,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4t-150', 'engine:1.4-122',
      'engine:2.0-170', 'engine:2.0-200',
      'engine:2.0d-170',
      'transmission:mt', 'transmission:at6', 'transmission:dsg7', 'transmission:dsg6',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: 'II (AD1) (2016-2022)',
    slug: 'ad1',
    yearStart: 2016,
    yearEnd: 2022,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-125', 'engine:1.4-150',
      'engine:2.0-180', 'engine:2.0-220',
      'engine:2.0d-150',
      'transmission:mt', 'transmission:dsg7', 'transmission:dsg7w', 'transmission:dsg6',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
]

export const volkswagenTiguanSeed = {
  brand: {
    name: 'Volkswagen',
    slug: 'volkswagen',
    logo: 'M12 0C5.36 0 0 5.36 0 12S5.36 24 12 24 24 18.64 24 12 18.64 0 12 0M12 1.41C13.2 1.41 14.36 1.63 15.43 2L12.13 9.13C12.09 9.17 12.09 9.26 12 9.26S11.91 9.17 11.87 9.13L8.57 2C9.64 1.63 10.8 1.42 12 1.42M6.9 2.74L10.72 10.97C10.8 11.14 10.89 11.19 11 11.19H13C13.12 11.19 13.2 11.14 13.29 10.97L17.06 2.74C18.64 3.64 20 4.93 20.96 6.47L15.6 16.84C15.56 16.93 15.5 16.97 15.47 16.97C15.39 16.97 15.39 16.89 15.34 16.84L13.29 12.3C13.2 12.13 13.12 12.09 13 12.09H11C10.89 12.09 10.8 12.13 10.71 12.3L8.66 16.84C8.61 16.89 8.62 16.97 8.53 16.97C8.44 16.97 8.44 16.89 8.4 16.84L3 6.47C3.94 4.93 5.32 3.64 6.9 2.74M2.06 8.53L8.23 20.53C8.31 20.7 8.4 20.83 8.62 20.83C8.83 20.83 8.91 20.7 9 20.53L11.87 14.14C11.91 14.06 11.96 14 12 14C12.09 14 12.09 14.1 12.13 14.14L15.04 20.53C15.13 20.7 15.21 20.83 15.43 20.83C15.64 20.83 15.73 20.7 15.81 20.53L22 8.53C22.37 9.6 22.59 10.76 22.59 12C22.54 17.79 17.79 22.59 12 22.59C6.21 22.59 1.46 17.79 1.46 12C1.46 10.8 1.67 9.65 2.06 8.53Z',
    sortOrder: 10,
  },

  model: {
    name: 'Tiguan',
    slug: 'tiguan',
    isPopular: true,
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
