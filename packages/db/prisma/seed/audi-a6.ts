import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainFWD, drivetrainAWD, fuelPumpHP, injectorsDiesel, turbo, intercooler, supercharger } from './builders'

const P = 'audi-a6'
const S = ['audi a6', 'ауди а6', 'a6', 'а6']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === C6 (4F) Petrol engines ===
  engine(P, S, '2.0-170', 'BPJ', 170, ['BPJ']),
  starter(P, S, '2.0-170'),
  alternator(P, S, '2.0-170'),
  fuelPumpHP(P, S, '2.0-170'),
  turbo(P, S, '2.0-170', 'BPJ'),
  intercooler(P, S, '2.0-170'),

  engine(P, S, '2.4-177', 'BDW', 177, ['BDW']),
  starter(P, S, '2.4-177'),
  alternator(P, S, '2.4-177'),

  engine(P, S, '2.8-190', 'CCDA', 190, ['CCDA']),
  starter(P, S, '2.8-190'),
  alternator(P, S, '2.8-190'),
  fuelPumpHP(P, S, '2.8-190'),

  engine(P, S, '2.8-220', 'CCEA', 220, ['CCEA']),
  starter(P, S, '2.8-220'),
  alternator(P, S, '2.8-220'),
  fuelPumpHP(P, S, '2.8-220'),

  engine(P, S, '3.0-218', 'BBJ', 218, ['BBJ']),
  starter(P, S, '3.0-218'),
  alternator(P, S, '3.0-218'),

  engine(P, S, '3.2-249', 'AUK', 249, ['AUK']),
  starter(P, S, '3.2-249'),
  alternator(P, S, '3.2-249'),
  fuelPumpHP(P, S, '3.2-249'),

  engine(P, S, '3.0-290', 'CAJA', 290, ['CAJA']),
  starter(P, S, '3.0-290'),
  alternator(P, S, '3.0-290'),
  fuelPumpHP(P, S, '3.0-290'),
  supercharger(P, S, '3.0-290', 'CAJA'),
  intercooler(P, S, '3.0-290'),

  engine(P, S, '4.2-335', 'BAT', 335, ['BAT']),
  starter(P, S, '4.2-335'),
  alternator(P, S, '4.2-335'),
  fuelPumpHP(P, S, '4.2-335'),

  // === C6 (4F) Diesel engines ===
  engine(P, S, '3.0d-225', 'BMK', 225, ['BMK']),
  starter(P, S, '3.0d-225'),
  alternator(P, S, '3.0d-225'),
  fuelPumpHP(P, S, '3.0d-225'),
  injectorsDiesel(P, S, '3.0d-225'),
  turbo(P, S, '3.0d-225', 'BMK'),
  intercooler(P, S, '3.0d-225'),

  engine(P, S, '3.0d-239', 'CDYA', 239, ['CDYA']),
  starter(P, S, '3.0d-239'),
  alternator(P, S, '3.0d-239'),
  fuelPumpHP(P, S, '3.0d-239'),
  injectorsDiesel(P, S, '3.0d-239'),
  turbo(P, S, '3.0d-239', 'CDYA'),
  intercooler(P, S, '3.0d-239'),

  // === C7 (4G) Petrol engines ===
  engine(P, S, '1.8-190', 'CYGA', 190, ['CYGA']),
  starter(P, S, '1.8-190'),
  alternator(P, S, '1.8-190'),
  fuelPumpHP(P, S, '1.8-190'),
  turbo(P, S, '1.8-190', 'CYGA'),
  intercooler(P, S, '1.8-190'),

  engine(P, S, '2.0-180', 'CDNB', 180, ['06H100031R']),
  starter(P, S, '2.0-180'),
  alternator(P, S, '2.0-180'),
  fuelPumpHP(P, S, '2.0-180'),
  turbo(P, S, '2.0-180', 'CDNB'),
  intercooler(P, S, '2.0-180'),

  engine(P, S, '2.8-204', 'CHVA', 204, ['CHVA']),
  starter(P, S, '2.8-204'),
  alternator(P, S, '2.8-204'),
  fuelPumpHP(P, S, '2.8-204'),

  engine(P, S, '3.0-310', 'CGWD', 310, ['CGWD']),
  starter(P, S, '3.0-310'),
  alternator(P, S, '3.0-310'),
  fuelPumpHP(P, S, '3.0-310'),
  supercharger(P, S, '3.0-310', 'CGWD'),
  intercooler(P, S, '3.0-310'),

  engine(P, S, '3.0-333', 'CREC', 333, ['CREC']),
  starter(P, S, '3.0-333'),
  alternator(P, S, '3.0-333'),
  fuelPumpHP(P, S, '3.0-333'),
  supercharger(P, S, '3.0-333', 'CREC'),
  intercooler(P, S, '3.0-333'),

  // === C7 (4G) Diesel engines ===
  engine(P, S, '2.0d-177', 'CGLC', 177, ['CGLC']),
  starter(P, S, '2.0d-177'),
  alternator(P, S, '2.0d-177'),
  fuelPumpHP(P, S, '2.0d-177'),
  injectorsDiesel(P, S, '2.0d-177'),
  turbo(P, S, '2.0d-177', 'CGLC'),
  intercooler(P, S, '2.0d-177'),

  engine(P, S, '2.0d-190', 'CNHA', 190, ['CNHA']),
  starter(P, S, '2.0d-190'),
  alternator(P, S, '2.0d-190'),
  fuelPumpHP(P, S, '2.0d-190'),
  injectorsDiesel(P, S, '2.0d-190'),
  turbo(P, S, '2.0d-190', 'CNHA'),
  intercooler(P, S, '2.0d-190'),

  engine(P, S, '3.0d-245', 'CDUD', 245, ['CDUD']),
  starter(P, S, '3.0d-245'),
  alternator(P, S, '3.0d-245'),
  fuelPumpHP(P, S, '3.0d-245'),
  injectorsDiesel(P, S, '3.0d-245'),
  turbo(P, S, '3.0d-245', 'CDUD'),
  intercooler(P, S, '3.0d-245'),

  // === C8 (4K) Petrol engines ===
  engine(P, S, '2.0-190c8', 'CVKB', 190, ['CVKB', '06L100032E']),
  starter(P, S, '2.0-190c8'),
  alternator(P, S, '2.0-190c8'),
  fuelPumpHP(P, S, '2.0-190c8'),
  turbo(P, S, '2.0-190c8', 'CVKB'),
  intercooler(P, S, '2.0-190c8'),

  engine(P, S, '2.0-245', 'DLBA', 245, ['DLBA', '06K100038S']),
  starter(P, S, '2.0-245'),
  alternator(P, S, '2.0-245'),
  fuelPumpHP(P, S, '2.0-245'),
  turbo(P, S, '2.0-245', 'DLBA'),
  intercooler(P, S, '2.0-245'),

  engine(P, S, '3.0-340', 'DLZA', 340, ['DLZA']),
  starter(P, S, '3.0-340'),
  alternator(P, S, '3.0-340'),
  fuelPumpHP(P, S, '3.0-340'),
  turbo(P, S, '3.0-340', 'DLZA'),
  intercooler(P, S, '3.0-340'),

  // === C8 (4K) Diesel engines ===
  engine(P, S, '2.0d-190c8', 'DFBA', 190, ['DFBA']),
  starter(P, S, '2.0d-190c8'),
  alternator(P, S, '2.0d-190c8'),
  fuelPumpHP(P, S, '2.0d-190c8'),
  injectorsDiesel(P, S, '2.0d-190c8'),
  turbo(P, S, '2.0d-190c8', 'DFBA'),
  intercooler(P, S, '2.0d-190c8'),

  engine(P, S, '3.0d-249', 'DDVE', 249, ['DDVE', '059100040K']),
  starter(P, S, '3.0d-249'),
  alternator(P, S, '3.0d-249'),
  fuelPumpHP(P, S, '3.0d-249'),
  injectorsDiesel(P, S, '3.0d-249'),
  turbo(P, S, '3.0d-249', 'DDVE'),
  intercooler(P, S, '3.0d-249'),

  // === Transmissions ===
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at6', 'Tiptronic 6-ступ (ZF 6HP)'),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'cvt', 'Multitronic (0AW)', ['0AW']),
  ecuTransmission(P, S, 'cvt'),
  transmission(P, S, 'robot', 'S-tronic 7-ступ (DL501)', ['0B5']),
  ecuTransmission(P, S, 'robot'),
  transmission(P, S, 'robot-c8', 'S-tronic 7-ступ (DL382)'),
  ecuTransmission(P, S, 'robot-c8'),
  transmission(P, S, 'at', 'Tiptronic 8-ступ (ZF 8HP)', ['0BK']),
  ecuTransmission(P, S, 'at'),

  // === Drivetrain (FWD + AWD) ===
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'C6 (4F) (2004-2011)',
    slug: '4f',
    yearStart: 2004,
    yearEnd: 2011,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-170', 'engine:2.4-177', 'engine:2.8-190', 'engine:2.8-220',
      'engine:3.0-218', 'engine:3.2-249', 'engine:3.0-290', 'engine:4.2-335',
      'engine:3.0d-225', 'engine:3.0d-239',
      'transmission:mt5', 'transmission:mt6', 'transmission:at6', 'transmission:cvt',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: 'C7 (4G) (2010-2018)',
    slug: '4g',
    yearStart: 2010,
    yearEnd: 2018,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-190', 'engine:2.0-180', 'engine:2.0-252', 'engine:2.8-204',
      'engine:3.0-310', 'engine:3.0-333',
      'engine:2.0d-177', 'engine:2.0d-190', 'engine:3.0d-245',
      'transmission:mt6', 'transmission:cvt', 'transmission:robot',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: 'C8 (4K) (2018-2025)',
    slug: '4k',
    yearStart: 2018,
    yearEnd: 2025,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-190c8', 'engine:2.0-245', 'engine:3.0-340',
      'engine:2.0d-190c8', 'engine:3.0d-249',
      'transmission:robot-c8', 'transmission:at',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
]

export const audiA6Seed = {
  brand: {
    name: 'Audi',
    slug: 'audi',
    logo: 'M19.848,7.848c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928C1.859,7.848,0,9.707,0,12s1.859,4.152,4.152,4.152c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928C22.141,16.152,24,14.293,24,12S22.141,7.848,19.848,7.848z M17.232,13.866c-0.376-0.526-0.598-1.17-0.598-1.866c0-0.696,0.222-1.34,0.598-1.866c0.376,0.526,0.598,1.17,0.598,1.866C17.83,12.696,17.608,13.34,17.232,13.866z M12,13.866c-0.376-0.526-0.598-1.17-0.598-1.866c0-0.696,0.222-1.34,0.598-1.866c0.376,0.526,0.598,1.17,0.598,1.866C12.598,12.696,12.376,13.34,12,13.866z M6.768,13.866C6.392,13.34,6.17,12.696,6.17,12c0-0.696,0.222-1.34,0.598-1.866C7.144,10.66,7.366,11.304,7.366,12C7.366,12.696,7.144,13.34,6.768,13.866z M0.938,12c0-1.775,1.439-3.214,3.214-3.214c0.736,0,1.414,0.248,1.956,0.665C5.56,10.154,5.232,11.039,5.232,12c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C2.377,15.214,0.938,13.775,0.938,12z M7.428,14.549C7.976,13.846,8.304,12.961,8.304,12c0-0.961-0.328-1.846-0.876-2.549c0.542-0.416,1.22-0.665,1.956-0.665c0.736,0,1.414,0.248,1.956,0.665c-0.549,0.704-0.876,1.588-0.876,2.549c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C8.648,15.214,7.97,14.966,7.428,14.549z M12.66,14.549c0.549-0.704,0.876-1.588,0.876-2.549c0-0.961-0.328-1.846-0.876-2.55c0.542-0.416,1.22-0.665,1.956-0.665s1.414,0.248,1.956,0.665c-0.549,0.704-0.876,1.588-0.876,2.549c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C13.88,15.214,13.202,14.966,12.66,14.549z M19.848,15.214c-0.736,0-1.414-0.248-1.956-0.665c0.548-0.704,0.876-1.588,0.876-2.549c0-0.961-0.328-1.846-0.876-2.549c0.542-0.416,1.22-0.665,1.956-0.665c1.775,0,3.214,1.439,3.214,3.214S21.623,15.214,19.848,15.214z',
    sortOrder: 2,
  },

  model: {
    name: 'A6',
    slug: 'a6',
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
