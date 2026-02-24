import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, fuelPumpHP, injectorsDiesel, transmission, ecuTransmission, drivetrainFWD, drivetrainAWD, turbo, intercooler } from './builders'

const P = 'volkswagen-passat'
const S = ['volkswagen passat', 'фольксваген пассат', 'пассат', 'passat', 'vw passat']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === B6 Petrol engines ===
  engine(P, S, '1.6-102', 'BSE', 102, ['06A100045S']),
  starter(P, S, '1.6-102'),
  alternator(P, S, '1.6-102'),

  engine(P, S, '1.4-122', 'CAXA', 122, ['03C100038P']),
  starter(P, S, '1.4-122'),
  alternator(P, S, '1.4-122'),
  fuelPumpHP(P, S, '1.4-122'),
  turbo(P, S, '1.4-122', 'CAXA'),
  intercooler(P, S, '1.4-122'),

  engine(P, S, '1.8-160', 'BZB', 160),
  starter(P, S, '1.8-160'),
  alternator(P, S, '1.8-160'),
  fuelPumpHP(P, S, '1.8-160'),
  turbo(P, S, '1.8-160', 'BZB'),
  intercooler(P, S, '1.8-160'),

  engine(P, S, '2.0-200', 'CAWB', 200),
  starter(P, S, '2.0-200'),
  alternator(P, S, '2.0-200'),
  fuelPumpHP(P, S, '2.0-200'),
  turbo(P, S, '2.0-200', 'CAWB'),
  intercooler(P, S, '2.0-200'),

  // === B7 Petrol engines ===
  engine(P, S, '1.8-152', 'CDAB', 152, ['06J100035F']),
  starter(P, S, '1.8-152'),
  alternator(P, S, '1.8-152'),
  fuelPumpHP(P, S, '1.8-152'),
  turbo(P, S, '1.8-152', 'CDAB'),
  intercooler(P, S, '1.8-152'),

  engine(P, S, '2.0-210', 'CCZB', 210),
  starter(P, S, '2.0-210'),
  alternator(P, S, '2.0-210'),
  fuelPumpHP(P, S, '2.0-210'),
  turbo(P, S, '2.0-210', 'CCZB'),
  intercooler(P, S, '2.0-210'),

  // === B8 Petrol engines ===
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

  engine(P, S, '2.0-220', 'CZPA', 220),
  starter(P, S, '2.0-220'),
  alternator(P, S, '2.0-220'),
  fuelPumpHP(P, S, '2.0-220'),
  turbo(P, S, '2.0-220', 'CZPA'),
  intercooler(P, S, '2.0-220'),

  // === Diesel engines ===
  engine(P, S, '1.9d-105', 'BKC', 105),
  starter(P, S, '1.9d-105'),
  alternator(P, S, '1.9d-105'),
  fuelPumpHP(P, S, '1.9d-105'),
  injectorsDiesel(P, S, '1.9d-105'),
  turbo(P, S, '1.9d-105', 'BKC'),
  intercooler(P, S, '1.9d-105'),

  engine(P, S, '2.0d-140', 'CBAB', 140),
  starter(P, S, '2.0d-140'),
  alternator(P, S, '2.0d-140'),
  fuelPumpHP(P, S, '2.0d-140'),
  injectorsDiesel(P, S, '2.0d-140'),
  turbo(P, S, '2.0d-140', 'CBAB'),
  intercooler(P, S, '2.0d-140'),

  engine(P, S, '2.0d-150', 'CRLB', 150),
  starter(P, S, '2.0d-150'),
  alternator(P, S, '2.0d-150'),
  fuelPumpHP(P, S, '2.0d-150'),
  injectorsDiesel(P, S, '2.0d-150'),
  turbo(P, S, '2.0d-150', 'CRLB'),
  intercooler(P, S, '2.0d-150'),

  // === Transmissions ===
  transmission(P, S, 'mt5', 'МКПП 5-ступ MQ200', ['02T300046R']),
  transmission(P, S, 'mt6', 'МКПП 6-ступ MQ350'),
  transmission(P, S, 'at6', 'АКПП 6-ступ Aisin 09G', ['09G300034']),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'dsg7', 'DSG-7 DQ200 (робот)', ['0AM300048']),
  ecuTransmission(P, S, 'dsg7'),
  transmission(P, S, 'dsg6', 'DSG-6 DQ250 (робот)', ['02E300043']),
  ecuTransmission(P, S, 'dsg6'),

  // === Drivetrain ===
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'B6 (3C) Sedan (2005-2010)',
    slug: 'b6',
    yearStart: 2005,
    yearEnd: 2010,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-102', 'engine:1.4-122', 'engine:1.8-160', 'engine:2.0-200',
      'engine:1.9d-105', 'engine:2.0d-140',
      'transmission:mt5', 'transmission:mt6', 'transmission:at6', 'transmission:dsg6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'B7 (362) Sedan (2010-2015)',
    slug: 'b7',
    yearStart: 2010,
    yearEnd: 2015,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-122', 'engine:1.8-152', 'engine:2.0-210',
      'transmission:mt6', 'transmission:dsg7', 'transmission:dsg6',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: 'B8 (3G) Sedan (2014-н.в.)',
    slug: 'b8',
    yearStart: 2014,
    yearEnd: 2024,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-125', 'engine:1.4-150', 'engine:1.8-180', 'engine:2.0-220',
      'engine:2.0d-150',
      'transmission:mt6', 'transmission:at6', 'transmission:dsg7', 'transmission:dsg6',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
]

export const volkswagenPassatSeed = {
  brand: {
    name: 'Volkswagen',
    slug: 'volkswagen',
    logo: 'M12 0C5.36 0 0 5.36 0 12S5.36 24 12 24 24 18.64 24 12 18.64 0 12 0M12 1.41C13.2 1.41 14.36 1.63 15.43 2L12.13 9.13C12.09 9.17 12.09 9.26 12 9.26S11.91 9.17 11.87 9.13L8.57 2C9.64 1.63 10.8 1.42 12 1.42M6.9 2.74L10.72 10.97C10.8 11.14 10.89 11.19 11 11.19H13C13.12 11.19 13.2 11.14 13.29 10.97L17.06 2.74C18.64 3.64 20 4.93 20.96 6.47L15.6 16.84C15.56 16.93 15.5 16.97 15.47 16.97C15.39 16.97 15.39 16.89 15.34 16.84L13.29 12.3C13.2 12.13 13.12 12.09 13 12.09H11C10.89 12.09 10.8 12.13 10.71 12.3L8.66 16.84C8.61 16.89 8.62 16.97 8.53 16.97C8.44 16.97 8.44 16.89 8.4 16.84L3 6.47C3.94 4.93 5.32 3.64 6.9 2.74M2.06 8.53L8.23 20.53C8.31 20.7 8.4 20.83 8.62 20.83C8.83 20.83 8.91 20.7 9 20.53L11.87 14.14C11.91 14.06 11.96 14 12 14C12.09 14 12.09 14.1 12.13 14.14L15.04 20.53C15.13 20.7 15.21 20.83 15.43 20.83C15.64 20.83 15.73 20.7 15.81 20.53L22 8.53C22.37 9.6 22.59 10.76 22.59 12C22.54 17.79 17.79 22.59 12 22.59C6.21 22.59 1.46 17.79 1.46 12C1.46 10.8 1.67 9.65 2.06 8.53Z',
    sortOrder: 10,
  },

  model: {
    name: 'Passat',
    slug: 'passat',
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
