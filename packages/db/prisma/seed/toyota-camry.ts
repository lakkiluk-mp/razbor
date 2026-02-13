import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainFWD, fuelPumpHP } from './builders'

const P = 'toyota-camry'
const S = ['toyota camry', 'тойота камри', 'камри', 'camry']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // XV40 engines
  engine(P, S, '2.4-167', '2AZ-FE', 167, ['1900028D00']),
  engine(P, S, '3.5-277', '2GR-FE V6', 277, ['190000P090']),

  // XV50 engines
  engine(P, S, '2.0-150-6ar', '6AR-FSE', 150),
  engine(P, S, '2.5-181', '2AR-FE', 181, ['190000V010']),

  // XV70 engines
  engine(P, S, '2.0-150-m20a', 'M20A-FKS', 150, ['190003Y280']),
  engine(P, S, '2.5-200', 'A25A-FKS', 200, ['19000F0010']),
  engine(P, S, '3.5-249', '2GR-FKS V6', 249, ['190000P440']),

  // КПП
  transmission(P, S, 'mt5', 'МКПП 5-ступ E351'),
  transmission(P, S, 'at5', 'АКПП 5-ступ U250E', ['3050033460']),
  transmission(P, S, 'at6-u660e', 'АКПП 6-ступ U660E'),
  transmission(P, S, 'at6-u760e', 'АКПП 6-ступ U760E', ['3050033770']),
  transmission(P, S, 'cvt', 'Direct Shift-CVT K120', ['3040012760']),
  transmission(P, S, 'at8', 'АКПП 8-ступ'),

  // ТНВД (D-4S двигатели)
  fuelPumpHP(P, S, '2.0-150-6ar'),
  fuelPumpHP(P, S, '2.0-150-m20a'),
  fuelPumpHP(P, S, '2.5-200'),
  fuelPumpHP(P, S, '3.5-249'),

  // Привод — только FWD
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'IX (XV70) (2017-2024)',
    slug: 'xv70',
    yearStart: 2017,
    yearEnd: 2024,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150-6ar',
      'engine:2.0-150-m20a',
      'engine:2.5-181',
      'engine:2.5-200',
      'engine:3.5-249',
      'transmission:at6-u760e',
      'transmission:cvt',
      'transmission:at8',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'VIII (XV50) (2011-2018)',
    slug: 'xv50',
    yearStart: 2011,
    yearEnd: 2018,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150-6ar',
      'engine:2.5-181',
      'engine:3.5-277',
      'transmission:at6-u760e',
      'transmission:at6-u660e',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'VII (XV40) (2006-2011)',
    slug: 'xv40',
    yearStart: 2006,
    yearEnd: 2011,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.4-167',
      'engine:3.5-277',
      'transmission:mt5',
      'transmission:at5',
      'transmission:at6-u660e',
      'drivetrain:fwd',
    ],
  },
]

export const toyotaCamrySeed = {
  brand: {
    name: 'Toyota',
    slug: 'toyota',
    logo: null,
    sortOrder: 11,
  },

  model: {
    name: 'Camry',
    slug: 'camry',
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
