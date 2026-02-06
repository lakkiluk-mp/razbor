import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainRWD, drivetrainAWD, fuelPumpHP } from './builders'

const P = 'mercedes-s-class'
const S = ['s class', 'с класс', 's-class']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // W140 engines (MPI — без ТНВД)
  engine(P, S, '2.8-193', 'M104', 193, ['104944']),
  engine(P, S, '3.2-231', 'M104', 231, ['104994']),
  engine(P, S, '4.2-279', 'M119', 279, ['119971']),
  engine(P, S, '5.0-320', 'M119', 320, ['119980']),

  // W220 engines (MPI — без ТНВД)
  engine(P, S, '3.2-224', 'M112', 224, ['112944']),
  engine(P, S, '3.7-245', 'M112', 245, ['112973']),
  engine(P, S, '4.3-279', 'M113', 279, ['113941']),
  engine(P, S, '5.0-306', 'M113', 306, ['113960']),

  // W221 engines
  engine(P, S, '3.5-272', 'M272', 272, ['272948']),
  engine(P, S, '4.7-340', 'M273', 340, ['273923']),
  engine(P, S, '5.5-388', 'M273', 388, ['273961']),
  engine(P, S, '3.5-306', 'M276', 306, ['276957']),
  fuelPumpHP(P, S, '3.5-306'),
  engine(P, S, '4.7-435', 'M278', 435, ['278929']),
  fuelPumpHP(P, S, '4.7-435'),

  // КПП (shared с C-Class)
  transmission(P, S, 'at5', 'АКПП 5-ступ', ['722.6']),
  transmission(P, S, 'at7', 'АКПП 7-ступ', ['722.9']),

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
    logo: null,
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
