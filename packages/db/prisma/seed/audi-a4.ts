import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainFWD, drivetrainAWD, fuelPumpHP, injectorsDiesel, turbo, intercooler, supercharger } from './builders'

const P = 'audi-a4'
const S = ['audi a4', 'ауди а4', 'a4', 'а4']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === B6 (8E) Petrol engines ===
  engine(P, S, '1.6-102', 'ALZ', 102, ['ALZ']),
  starter(P, S, '1.6-102'),
  alternator(P, S, '1.6-102'),

  engine(P, S, '2.0-130', 'ALT', 130, ['ALT']),
  starter(P, S, '2.0-130'),
  alternator(P, S, '2.0-130'),

  engine(P, S, '1.8t-150', 'AVJ', 150, ['AVJ']),
  starter(P, S, '1.8t-150'),
  alternator(P, S, '1.8t-150'),
  turbo(P, S, '1.8t-150', 'AVJ'),
  intercooler(P, S, '1.8t-150'),

  engine(P, S, '2.4-170', 'BDV', 170, ['BDV']),
  starter(P, S, '2.4-170'),
  alternator(P, S, '2.4-170'),

  engine(P, S, '3.0-220', 'ASN', 220, ['ASN']),
  starter(P, S, '3.0-220'),
  alternator(P, S, '3.0-220'),

  // === B6 (8E) Diesel engines ===
  engine(P, S, '1.9d-130', 'AVF', 130, ['AVF']),
  starter(P, S, '1.9d-130'),
  alternator(P, S, '1.9d-130'),
  fuelPumpHP(P, S, '1.9d-130'),
  injectorsDiesel(P, S, '1.9d-130'),
  turbo(P, S, '1.9d-130', 'AVF'),
  intercooler(P, S, '1.9d-130'),

  engine(P, S, '2.5d-155', 'AYM', 155, ['AYM']),
  starter(P, S, '2.5d-155'),
  alternator(P, S, '2.5d-155'),
  fuelPumpHP(P, S, '2.5d-155'),
  injectorsDiesel(P, S, '2.5d-155'),
  turbo(P, S, '2.5d-155', 'AYM'),
  intercooler(P, S, '2.5d-155'),

  // === B7 (8E) Petrol engines ===
  engine(P, S, '2.0t-200', 'BWE', 200, ['BWE']),
  starter(P, S, '2.0t-200'),
  alternator(P, S, '2.0t-200'),
  fuelPumpHP(P, S, '2.0t-200'),
  turbo(P, S, '2.0t-200', 'BWE'),
  intercooler(P, S, '2.0t-200'),

  engine(P, S, '3.0-218', 'BBJ', 218, ['BBJ']),
  starter(P, S, '3.0-218'),
  alternator(P, S, '3.0-218'),

  // === B7 (8E) Diesel engines ===
  engine(P, S, '2.0d-140', 'BPW', 140, ['BPW']),
  starter(P, S, '2.0d-140'),
  alternator(P, S, '2.0d-140'),
  fuelPumpHP(P, S, '2.0d-140'),
  injectorsDiesel(P, S, '2.0d-140'),
  turbo(P, S, '2.0d-140', 'BPW'),
  intercooler(P, S, '2.0d-140'),

  engine(P, S, '3.0d-204', 'BKN', 204, ['BKN']),
  starter(P, S, '3.0d-204'),
  alternator(P, S, '3.0d-204'),
  fuelPumpHP(P, S, '3.0d-204'),
  injectorsDiesel(P, S, '3.0d-204'),
  turbo(P, S, '3.0d-204', 'BKN'),
  intercooler(P, S, '3.0d-204'),

  // === B8 (8K) Petrol engines — local ===
  engine(P, S, '1.8-120', 'CABA', 120, ['CABA']),
  starter(P, S, '1.8-120'),
  alternator(P, S, '1.8-120'),
  fuelPumpHP(P, S, '1.8-120'),
  turbo(P, S, '1.8-120', 'CABA'),
  intercooler(P, S, '1.8-120'),

  engine(P, S, '1.8-170', 'CJEB', 170, ['CJEB']),
  starter(P, S, '1.8-170'),
  alternator(P, S, '1.8-170'),
  fuelPumpHP(P, S, '1.8-170'),
  turbo(P, S, '1.8-170', 'CJEB'),
  intercooler(P, S, '1.8-170'),

  // === B8 (8K) Petrol engines — shared ===
  engine(P, S, '2.0-180', 'CDNB', 180, ['06H100031R']),
  starter(P, S, '2.0-180'),
  alternator(P, S, '2.0-180'),
  fuelPumpHP(P, S, '2.0-180'),
  turbo(P, S, '2.0-180', 'CDNB'),
  intercooler(P, S, '2.0-180'),

  engine(P, S, '2.0-211', 'CDNC', 211, ['06H100035H']),
  starter(P, S, '2.0-211'),
  alternator(P, S, '2.0-211'),
  fuelPumpHP(P, S, '2.0-211'),
  turbo(P, S, '2.0-211', 'CDNC'),
  intercooler(P, S, '2.0-211'),

  engine(P, S, '2.0-225', 'CNCD', 225, ['06L100032L']),
  starter(P, S, '2.0-225'),
  alternator(P, S, '2.0-225'),
  fuelPumpHP(P, S, '2.0-225'),
  turbo(P, S, '2.0-225', 'CNCD'),
  intercooler(P, S, '2.0-225'),

  // === B8 (8K) Petrol engines — local (large) ===
  engine(P, S, '3.2-265', 'CALA', 265, ['CALA']),
  starter(P, S, '3.2-265'),
  alternator(P, S, '3.2-265'),
  fuelPumpHP(P, S, '3.2-265'),

  // === B8 (8K) Diesel engines — shared ===
  engine(P, S, '2.0d-177', 'CGLC', 177, ['CGLC']),
  starter(P, S, '2.0d-177'),
  alternator(P, S, '2.0d-177'),
  fuelPumpHP(P, S, '2.0d-177'),
  injectorsDiesel(P, S, '2.0d-177'),
  turbo(P, S, '2.0d-177', 'CGLC'),
  intercooler(P, S, '2.0d-177'),

  engine(P, S, '3.0d-240', 'CCWA', 240, ['CCWA']),
  starter(P, S, '3.0d-240'),
  alternator(P, S, '3.0d-240'),
  fuelPumpHP(P, S, '3.0d-240'),
  injectorsDiesel(P, S, '3.0d-240'),
  turbo(P, S, '3.0d-240', 'CCWA'),
  intercooler(P, S, '3.0d-240'),

  engine(P, S, '3.0d-245', 'CDUD', 245, ['CDUD']),
  starter(P, S, '3.0d-245'),
  alternator(P, S, '3.0d-245'),
  fuelPumpHP(P, S, '3.0d-245'),
  injectorsDiesel(P, S, '3.0d-245'),
  turbo(P, S, '3.0d-245', 'CDUD'),
  intercooler(P, S, '3.0d-245'),

  // === B8 (8K) Diesel engines — local ===
  engine(P, S, '2.0d-143', 'CAGA', 143, ['CAGA']),
  starter(P, S, '2.0d-143'),
  alternator(P, S, '2.0d-143'),
  fuelPumpHP(P, S, '2.0d-143'),
  injectorsDiesel(P, S, '2.0d-143'),
  turbo(P, S, '2.0d-143', 'CAGA'),
  intercooler(P, S, '2.0d-143'),

  // === B9 (8W) Petrol engines — local ===
  engine(P, S, '1.4-150', 'CVNA', 150, ['CVNA']),
  starter(P, S, '1.4-150'),
  alternator(P, S, '1.4-150'),
  fuelPumpHP(P, S, '1.4-150'),
  turbo(P, S, '1.4-150', 'CVNA'),
  intercooler(P, S, '1.4-150'),

  // === B9 (8W) Petrol engines — shared ===
  engine(P, S, '2.0-190', 'CVKB', 190, ['CVKB']),
  starter(P, S, '2.0-190'),
  alternator(P, S, '2.0-190'),
  fuelPumpHP(P, S, '2.0-190'),
  turbo(P, S, '2.0-190', 'CVKB'),
  intercooler(P, S, '2.0-190'),

  // === B9 (8W) Petrol engines — local ===
  engine(P, S, '2.0-249', 'CYRB', 249, ['CYRB']),
  starter(P, S, '2.0-249'),
  alternator(P, S, '2.0-249'),
  fuelPumpHP(P, S, '2.0-249'),
  turbo(P, S, '2.0-249', 'CYRB'),
  intercooler(P, S, '2.0-249'),

  // === B9 (8W) Diesel engines — local ===
  engine(P, S, '2.0d-150', 'DEUA', 150, ['DEUA']),
  starter(P, S, '2.0d-150'),
  alternator(P, S, '2.0d-150'),
  fuelPumpHP(P, S, '2.0d-150'),
  injectorsDiesel(P, S, '2.0d-150'),
  turbo(P, S, '2.0d-150', 'DEUA'),
  intercooler(P, S, '2.0d-150'),

  // === B9 (8W) Diesel engines — shared ===
  engine(P, S, '2.0d-190', 'DETA', 190, ['DETA']),
  starter(P, S, '2.0d-190'),
  alternator(P, S, '2.0d-190'),
  fuelPumpHP(P, S, '2.0d-190'),
  injectorsDiesel(P, S, '2.0d-190'),
  turbo(P, S, '2.0d-190', 'DETA'),
  intercooler(P, S, '2.0d-190'),

  // === Transmissions ===
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at6', 'Tiptronic 6-ступ (ZF 6HP)'),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'cvt', 'Multitronic (0AW)', ['0AW']),
  ecuTransmission(P, S, 'cvt'),
  transmission(P, S, 'robot', 'S-tronic 7-ступ (DL501)', ['0B5']),
  ecuTransmission(P, S, 'robot'),
  transmission(P, S, 'robot-b9', 'S-tronic 7-ступ (DL382)'),
  ecuTransmission(P, S, 'robot-b9'),
  transmission(P, S, 'at', 'Tiptronic 8-ступ (ZF 8HP)', ['0BK']),
  ecuTransmission(P, S, 'at'),

  // === Drivetrain (FWD + AWD) ===
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'B6 (8E) (2000-2006)',
    slug: '8e-b6',
    yearStart: 2000,
    yearEnd: 2006,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-102', 'engine:2.0-130', 'engine:1.8t-150', 'engine:2.4-170', 'engine:3.0-220',
      'engine:1.9d-130', 'engine:2.5d-155',
      'transmission:mt5', 'transmission:at6', 'transmission:cvt',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: 'B7 (8E) (2004-2009)',
    slug: '8e-b7',
    yearStart: 2004,
    yearEnd: 2009,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-102', 'engine:2.0-130', 'engine:2.0t-200', 'engine:3.0-218',
      'engine:2.0d-140', 'engine:3.0d-204',
      'transmission:mt5', 'transmission:at6', 'transmission:cvt',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: 'B8 (8K) (2007-2016)',
    slug: '8k',
    yearStart: 2007,
    yearEnd: 2016,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-120', 'engine:1.8-170', 'engine:2.0-180', 'engine:2.0-211', 'engine:2.0-225',
      'engine:3.2-265',
      'engine:2.0d-143', 'engine:2.0d-177', 'engine:3.0d-240', 'engine:3.0d-245',
      'transmission:mt6', 'transmission:cvt', 'transmission:robot',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: 'B9 (8W) (2015-2024)',
    slug: '8w',
    yearStart: 2015,
    yearEnd: 2024,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-150', 'engine:2.0-190', 'engine:2.0-249',
      'engine:2.0d-150', 'engine:2.0d-190',
      'transmission:mt6', 'transmission:robot-b9', 'transmission:at',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
]

export const audiA4Seed = {
  brand: {
    name: 'Audi',
    slug: 'audi',
    logo: 'M19.848,7.848c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928C1.859,7.848,0,9.707,0,12s1.859,4.152,4.152,4.152c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928C22.141,16.152,24,14.293,24,12S22.141,7.848,19.848,7.848z M17.232,13.866c-0.376-0.526-0.598-1.17-0.598-1.866c0-0.696,0.222-1.34,0.598-1.866c0.376,0.526,0.598,1.17,0.598,1.866C17.83,12.696,17.608,13.34,17.232,13.866z M12,13.866c-0.376-0.526-0.598-1.17-0.598-1.866c0-0.696,0.222-1.34,0.598-1.866c0.376,0.526,0.598,1.17,0.598,1.866C12.598,12.696,12.376,13.34,12,13.866z M6.768,13.866C6.392,13.34,6.17,12.696,6.17,12c0-0.696,0.222-1.34,0.598-1.866C7.144,10.66,7.366,11.304,7.366,12C7.366,12.696,7.144,13.34,6.768,13.866z M0.938,12c0-1.775,1.439-3.214,3.214-3.214c0.736,0,1.414,0.248,1.956,0.665C5.56,10.154,5.232,11.039,5.232,12c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C2.377,15.214,0.938,13.775,0.938,12z M7.428,14.549C7.976,13.846,8.304,12.961,8.304,12c0-0.961-0.328-1.846-0.876-2.549c0.542-0.416,1.22-0.665,1.956-0.665c0.736,0,1.414,0.248,1.956,0.665c-0.549,0.704-0.876,1.588-0.876,2.549c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C8.648,15.214,7.97,14.966,7.428,14.549z M12.66,14.549c0.549-0.704,0.876-1.588,0.876-2.549c0-0.961-0.328-1.846-0.876-2.55c0.542-0.416,1.22-0.665,1.956-0.665s1.414,0.248,1.956,0.665c-0.549,0.704-0.876,1.588-0.876,2.549c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C13.88,15.214,13.202,14.966,12.66,14.549z M19.848,15.214c-0.736,0-1.414-0.248-1.956-0.665c0.548-0.704,0.876-1.588,0.876-2.549c0-0.961-0.328-1.846-0.876-2.549c0.542-0.416,1.22-0.665,1.956-0.665c1.775,0,3.214,1.439,3.214,3.214S21.623,15.214,19.848,15.214z',
    sortOrder: 2,
  },

  model: {
    name: 'A4',
    slug: 'a4',
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
