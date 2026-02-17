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
    logo: 'M12 3.848C5.223 3.848 0 7.298 0 12c0 4.702 5.224 8.152 12 8.152S24 16.702 24 12c0-4.702-5.223-8.152-12-8.152zm7.334 3.839c0 1.08-1.725 1.913-4.488 2.246-.26-2.58-1.005-4.279-1.963-4.913 2.948.184 6.45 1.227 6.45 2.667zM12 16.401c-.96 0-1.746-1.5-1.808-4.389.577.047 1.18.072 1.808.072.628 0 1.23-.025 1.807-.072-.061 2.89-.847 4.389-1.807 4.389zm0-6.308c-.59 0-1.155-.019-1.69-.054.261-1.728.92-3.15 1.69-3.15.77 0 1.428 1.422 1.689 3.15-.535.034-1.099.054-1.689.054zm-.882-5.075c-.956.633-1.706 2.333-1.964 4.915C6.391 9.6 4.665 8.767 4.665 7.687c0-1.44 3.504-2.49 6.453-2.669zM2.037 11.68a5.265 5.265 0 011.048-3.164c.27 1.547 2.522 2.881 5.972 3.37V12c0 3.772.879 6.203 2.087 6.97-5.107-.321-9.107-3.48-9.107-7.29zm10.823 7.29c1.207-.767 2.087-3.198 2.087-6.97v-.115c3.447-.488 5.704-1.826 5.972-3.37a5.26 5.26 0 011.049 3.165c-.004 3.81-4.008 6.969-9.109 7.29z',
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
