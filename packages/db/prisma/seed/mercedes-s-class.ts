import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainRWD, drivetrainAWD, fuelPumpHP, turbo, intercooler } from './builders'

const P = 'mercedes-s-class'
const S = ['s class', 'с класс', 's-class']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // W140 engines (MPI — без ТНВД)
  engine(P, S, '2.8-193', 'M104', 193, ['104944']),
  starter(P, S, '2.8-193'),
  alternator(P, S, '2.8-193'),
  engine(P, S, '3.2-231', 'M104', 231, ['104994']),
  starter(P, S, '3.2-231'),
  alternator(P, S, '3.2-231'),
  engine(P, S, '4.2-279', 'M119', 279, ['119971']),
  starter(P, S, '4.2-279'),
  alternator(P, S, '4.2-279'),
  engine(P, S, '5.0-320', 'M119', 320, ['119980']),
  starter(P, S, '5.0-320'),
  alternator(P, S, '5.0-320'),

  // W220 engines (MPI — без ТНВД)
  engine(P, S, '3.2-224', 'M112', 224, ['112944']),
  starter(P, S, '3.2-224'),
  alternator(P, S, '3.2-224'),
  engine(P, S, '3.7-245', 'M112', 245, ['112973']),
  starter(P, S, '3.7-245'),
  alternator(P, S, '3.7-245'),
  engine(P, S, '4.3-279', 'M113', 279, ['113941']),
  starter(P, S, '4.3-279'),
  alternator(P, S, '4.3-279'),
  engine(P, S, '5.0-306', 'M113', 306, ['113960']),
  starter(P, S, '5.0-306'),
  alternator(P, S, '5.0-306'),

  // W221 engines
  engine(P, S, '3.5-272', 'M272', 272, ['272948']),
  starter(P, S, '3.5-272'),
  alternator(P, S, '3.5-272'),
  engine(P, S, '4.7-340', 'M273', 340, ['273923']),
  starter(P, S, '4.7-340'),
  alternator(P, S, '4.7-340'),
  engine(P, S, '5.5-388', 'M273', 388, ['273961']),
  starter(P, S, '5.5-388'),
  alternator(P, S, '5.5-388'),
  engine(P, S, '3.5-306', 'M276', 306, ['276957']),
  starter(P, S, '3.5-306'),
  alternator(P, S, '3.5-306'),
  fuelPumpHP(P, S, '3.5-306'),
  turbo(P, S, '3.5-306', 'M276', 'A2760900300', 'left'),
  turbo(P, S, '3.5-306', 'M276', 'A2760900400', 'right'),
  intercooler(P, S, '3.5-306'),
  engine(P, S, '4.7-435', 'M278', 435, ['278929']),
  starter(P, S, '4.7-435'),
  alternator(P, S, '4.7-435'),
  fuelPumpHP(P, S, '4.7-435'),
  turbo(P, S, '4.7-435', 'M278', 'A2780903580', 'left'),
  turbo(P, S, '4.7-435', 'M278', 'A2780901880', 'right'),
  intercooler(P, S, '4.7-435'),

  // КПП (shared с C-Class)
  transmission(P, S, 'at5', 'АКПП 5-ступ', ['722.6']),
  ecuTransmission(P, S, 'at5'),
  transmission(P, S, 'at7', 'АКПП 7-ступ', ['722.9']),
  ecuTransmission(P, S, 'at7'),

  // Привод
  ...drivetrainRWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'V (W221/V221) (2005-2013)',
    slug: 'w221',
    yearStart: 2005,
    yearEnd: 2013,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.5-272',
      'engine:4.7-340',
      'engine:5.5-388',
      'engine:3.5-306',
      'engine:4.7-435',
      'transmission:at7',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'IV (W220/V220) (1998-2005)',
    slug: 'w220',
    yearStart: 1998,
    yearEnd: 2005,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.2-224',
      'engine:3.7-245',
      'engine:4.3-279',
      'engine:5.0-306',
      'transmission:at5',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'III (W140/V140) (1991-1998)',
    slug: 'w140',
    yearStart: 1991,
    yearEnd: 1998,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.8-193',
      'engine:3.2-231',
      'engine:4.2-279',
      'engine:5.0-320',
      'transmission:at5',
      'drivetrain:rwd',
    ],
  },
]

export const mercedesSClassSeed = {
  brand: {
    name: 'Mercedes-Benz',
    slug: 'mercedes-benz',
    logo: 'M17.58,1.35C15.9,0.48,14.01,0,12,0c-2.01,0-3.9,0.48-5.58,1.35v0C2.61,3.36,0,7.38,0,12c0,4.62,2.61,8.64,6.45,10.65C8.1,23.49,9.99,24,12,24c2.01,0,3.87-0.51,5.55-1.38C21.39,20.64,24,16.62,24,12C24,7.38,21.39,3.36,17.58,1.35z M1.2,12c0-3.93,2.1-7.35,5.25-9.27v0C7.98,1.8,9.75,1.26,11.7,1.2l-1.35,9.81L6.45,14.04v0L2.49,17.13C1.68,15.6,1.2,13.86,1.2,12z M17.58,21.24C15.93,22.23,14.04,22.8,12,22.8c-2.04,0-3.96-0.57-5.58-1.56c-1.47-0.87-2.67-2.07-3.57-3.51l3.57-1.47v0L12,13.98l5.58,2.25v0l3.6,1.47C20.28,19.17,19.02,20.37,17.58,21.24z M17.58,14.04L17.58,14.04l-3.87-3L12.33,1.2c1.89,0.06,3.69,0.6,5.22,1.53v0C20.7,4.62,22.8,8.07,22.8,12c0,1.86-0.45,3.6-1.29,5.13L17.58,14.04z',
    sortOrder: 3,
  },

  model: {
    name: 'S-Class',
    slug: 's-class',
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
