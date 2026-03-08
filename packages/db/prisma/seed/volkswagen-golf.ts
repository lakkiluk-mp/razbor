import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import {
  engine,
  starter,
  alternator,
  fuelPumpHP,
  transmission,
  ecuTransmission,
  drivetrainFWD,
  turbo,
  intercooler,
} from './builders'

const P = 'volkswagen-golf'
const S = ['volkswagen golf', 'фольксваген гольф', 'гольф', 'golf', 'vw golf']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === Golf 7 (5G) engines ===

  // 1.2 TSI 105hp CJZA
  engine(P, S, '1.2-105', 'CJZA', 105),
  starter(P, S, '1.2-105'),
  alternator(P, S, '1.2-105'),
  fuelPumpHP(P, S, '1.2-105'),
  turbo(P, S, '1.2-105', 'CJZA'),
  intercooler(P, S, '1.2-105'),

  // 1.4 TSI 125hp CZCA — shared
  engine(P, S, '1.4-125', 'CZCA', 125, ['04E100033B']),
  starter(P, S, '1.4-125'),
  alternator(P, S, '1.4-125'),
  fuelPumpHP(P, S, '1.4-125'),
  turbo(P, S, '1.4-125', 'CZCA'),
  intercooler(P, S, '1.4-125'),

  // 1.4 TSI 150hp CZEA — shared
  engine(P, S, '1.4-150', 'CZEA', 150, ['04E100034F']),
  starter(P, S, '1.4-150'),
  alternator(P, S, '1.4-150'),
  fuelPumpHP(P, S, '1.4-150'),
  turbo(P, S, '1.4-150', 'CZEA'),
  intercooler(P, S, '1.4-150'),

  // 2.0 TSI 220hp CHHB — shared
  engine(P, S, '2.0-220', 'CHHB', 220, ['06K100038S']),
  starter(P, S, '2.0-220'),
  alternator(P, S, '2.0-220'),
  fuelPumpHP(P, S, '2.0-220'),
  turbo(P, S, '2.0-220', 'CHHB'),
  intercooler(P, S, '2.0-220'),

  // === Golf 6 (5K) engines ===

  // 1.2 TSI 85hp CBZA
  engine(P, S, '1.2-85-g6', 'CBZA', 85),
  starter(P, S, '1.2-85-g6'),
  alternator(P, S, '1.2-85-g6'),
  fuelPumpHP(P, S, '1.2-85-g6'),
  turbo(P, S, '1.2-85-g6', 'CBZA'),
  intercooler(P, S, '1.2-85-g6'),

  // 1.2 TSI 105hp CBZB
  engine(P, S, '1.2-105-g6', 'CBZB', 105),
  starter(P, S, '1.2-105-g6'),
  alternator(P, S, '1.2-105-g6'),
  fuelPumpHP(P, S, '1.2-105-g6'),
  turbo(P, S, '1.2-105-g6', 'CBZB'),
  intercooler(P, S, '1.2-105-g6'),

  // 1.4 MPI 80hp CGGA (атмо)
  engine(P, S, '1.4-80', 'CGGA', 80),
  starter(P, S, '1.4-80'),
  alternator(P, S, '1.4-80'),

  // 1.4 TSI 122hp CAXA — shared (EA111)
  engine(P, S, '1.4-122-caxa', 'CAXA', 122, ['03C100038P']),
  starter(P, S, '1.4-122-caxa'),
  alternator(P, S, '1.4-122-caxa'),
  fuelPumpHP(P, S, '1.4-122-caxa'),
  turbo(P, S, '1.4-122-caxa', 'CAXA'),
  intercooler(P, S, '1.4-122-caxa'),

  // 1.6 MPI 102hp BSE — shared (атмо)
  engine(P, S, '1.6-102', 'BSE', 102, ['06A100045S']),
  starter(P, S, '1.6-102'),
  alternator(P, S, '1.6-102'),

  // === Golf 5 (1K) engines ===

  // 1.6 MPI 102hp BSE — shared (reuse config from Golf 6)
  // BSE already defined above with config '1.6-102'

  // 1.6 FSI 115hp BLF (GDI, атмо)
  engine(P, S, '1.6-115', 'BLF', 115),
  starter(P, S, '1.6-115'),
  alternator(P, S, '1.6-115'),
  fuelPumpHP(P, S, '1.6-115'),

  // 1.4 TSI 122hp CAXA — shared (reuse from Golf 6)
  // CAXA already defined above with config '1.4-122-caxa'

  // === Golf 4 (1J) engines ===

  // 1.4 MPI 75hp AHW (атмо)
  engine(P, S, '1.4-75', 'AHW', 75),
  starter(P, S, '1.4-75'),
  alternator(P, S, '1.4-75'),

  // 1.6 MPI 100hp AEH (атмо)
  engine(P, S, '1.6-100', 'AEH', 100),
  starter(P, S, '1.6-100'),
  alternator(P, S, '1.6-100'),

  // 1.6 MPI 102hp AVU (атмо)
  engine(P, S, '1.6-102-g4', 'AVU', 102),
  starter(P, S, '1.6-102-g4'),
  alternator(P, S, '1.6-102-g4'),

  // 1.8T 150hp AGU (MPI+turbo)
  engine(P, S, '1.8t-150', 'AGU', 150),
  starter(P, S, '1.8t-150'),
  alternator(P, S, '1.8t-150'),
  turbo(P, S, '1.8t-150', 'AGU'),
  intercooler(P, S, '1.8t-150'),

  // 2.0 MPI 115hp APK (атмо)
  engine(P, S, '2.0-115', 'APK', 115),
  starter(P, S, '2.0-115'),
  alternator(P, S, '2.0-115'),

  // === Трансмиссии ===

  // МКПП 5-ступ MQ200 — shared (Golf 5/6/7)
  transmission(P, S, 'mt5', 'МКПП 5-ступ MQ200', ['02T300046R']),

  // АКПП 6-ступ Aisin 09G — shared (Golf 5/6)
  transmission(P, S, 'at6', 'АКПП 6-ступ Aisin 09G', ['09G300034']),
  ecuTransmission(P, S, 'at6'),

  // DSG-7 DQ200 — shared (Golf 5/6/7)
  transmission(P, S, 'dsg7', 'DSG-7 DQ200 (робот)', ['0AM300048']),
  ecuTransmission(P, S, 'dsg7'),

  // DSG-6 DQ250 — shared (Golf 7)
  transmission(P, S, 'dsg6', 'DSG-6 DQ250 (робот)', ['02E300043']),
  ecuTransmission(P, S, 'dsg6'),

  // МКПП 5-ступ 02J — Golf 4 specific (не shared)
  transmission(P, S, 'mt5-g4', 'МКПП 5-ступ (02J)'),

  // АКПП 4-ступ 01M — Golf 4 specific (не shared)
  transmission(P, S, 'at4', 'АКПП 4-ступ (01M)'),
  ecuTransmission(P, S, 'at4'),

  // === Привод ===
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'VII (5G) (2012-2019)',
    slug: '5g',
    yearStart: 2012,
    yearEnd: 2019,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.2-105',
      'engine:1.4-125', 'engine:1.4-150',
      'engine:2.0-220',
      'transmission:mt5', 'transmission:dsg7', 'transmission:dsg6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'VI (5K) (2008-2013)',
    slug: '5k',
    yearStart: 2008,
    yearEnd: 2013,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.2-85-g6', 'engine:1.2-105-g6',
      'engine:1.4-80', 'engine:1.4-122-caxa', 'engine:1.6-102',
      'transmission:mt5', 'transmission:at6', 'transmission:dsg7',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'V (1K) (2003-2008)',
    slug: '1k',
    yearStart: 2003,
    yearEnd: 2008,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-102', 'engine:1.6-115', 'engine:1.4-122-caxa',
      'transmission:mt5', 'transmission:at6', 'transmission:dsg7',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'IV (1J) (1997-2004)',
    slug: '1j',
    yearStart: 1997,
    yearEnd: 2004,
    bodyType: 'hatchback' as BodyType,
    isActive: false,
    availableConfigs: [
      'engine:1.4-75', 'engine:1.6-100', 'engine:1.6-102-g4',
      'engine:1.8t-150', 'engine:2.0-115',
      'transmission:mt5-g4', 'transmission:at4',
      'drivetrain:fwd',
    ],
  },
]

export const volkswagenGolfSeed = {
  brand: {
    name: 'Volkswagen',
    slug: 'volkswagen',
    logo: 'M12 0C5.36 0 0 5.36 0 12S5.36 24 12 24 24 18.64 24 12 18.64 0 12 0M12 1.41C13.2 1.41 14.36 1.63 15.43 2L12.13 9.13C12.09 9.17 12.09 9.26 12 9.26S11.91 9.17 11.87 9.13L8.57 2C9.64 1.63 10.8 1.42 12 1.42M6.9 2.74L10.72 10.97C10.8 11.14 10.89 11.19 11 11.19H13C13.12 11.19 13.2 11.14 13.29 10.97L17.06 2.74C18.64 3.64 20 4.93 20.96 6.47L15.6 16.84C15.56 16.93 15.5 16.97 15.47 16.97C15.39 16.97 15.39 16.89 15.34 16.84L13.29 12.3C13.2 12.13 13.12 12.09 13 12.09H11C10.89 12.09 10.8 12.13 10.71 12.3L8.66 16.84C8.61 16.89 8.62 16.97 8.53 16.97C8.44 16.97 8.44 16.89 8.4 16.84L3 6.47C3.94 4.93 5.32 3.64 6.9 2.74M2.06 8.53L8.23 20.53C8.31 20.7 8.4 20.83 8.62 20.83C8.83 20.83 8.91 20.7 9 20.53L11.87 14.14C11.91 14.06 11.96 14 12 14C12.09 14 12.09 14.1 12.13 14.14L15.04 20.53C15.13 20.7 15.21 20.83 15.43 20.83C15.64 20.83 15.73 20.7 15.81 20.53L22 8.53C22.37 9.6 22.59 10.76 22.59 12C22.54 17.79 17.79 22.59 12 22.59C6.21 22.59 1.46 17.79 1.46 12C1.46 10.8 1.67 9.65 2.06 8.53Z',
    sortOrder: 10,
  },

  model: {
    name: 'Golf',
    slug: 'golf',
    isPopular: true,
    sortOrder: 4,
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
