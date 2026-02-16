import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainAWD, fuelPumpHP, injectorsDiesel } from './builders'

const P = 'audi-q5'
const S = ['q5', 'ку5', 'q 5']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === 8R Petrol engines ===
  engine(P, S, '2.0-180', 'CDNB', 180, ['06H100031R']),
  fuelPumpHP(P, S, '2.0-180'),
  engine(P, S, '2.0-211', 'CDNC', 211, ['06H100035H']),
  fuelPumpHP(P, S, '2.0-211'),
  engine(P, S, '2.0-225', 'CNCD', 225, ['06L100032L']),
  fuelPumpHP(P, S, '2.0-225'),
  engine(P, S, '2.0-230', 'CNCE', 230, ['CNCE']),
  fuelPumpHP(P, S, '2.0-230'),
  engine(P, S, '3.2-270', 'CALB', 270, ['06E100031L']),
  fuelPumpHP(P, S, '3.2-270'),
  engine(P, S, '3.0-272', 'CTUC', 272, ['06E100036A']),
  fuelPumpHP(P, S, '3.0-272'),

  // === 8R Diesel engines ===
  engine(P, S, '2.0d-170', 'CAHA', 170, ['03L100036C']),
  fuelPumpHP(P, S, '2.0d-170'),
  injectorsDiesel(P, S, '2.0d-170'),
  engine(P, S, '2.0d-177', 'CGLC', 177, ['CGLC']),
  fuelPumpHP(P, S, '2.0d-177'),
  injectorsDiesel(P, S, '2.0d-177'),
  engine(P, S, '3.0d-240', 'CCWA', 240, ['CCWA']),
  fuelPumpHP(P, S, '3.0d-240'),
  injectorsDiesel(P, S, '3.0d-240'),
  engine(P, S, '3.0d-245', 'CDUD', 245, ['CDUD']),
  fuelPumpHP(P, S, '3.0d-245'),
  injectorsDiesel(P, S, '3.0d-245'),

  // === FY Petrol engines ===
  engine(P, S, '2.0-249', 'DAXB', 249, ['06L100032T']),
  fuelPumpHP(P, S, '2.0-249'),

  // === FY Diesel engines ===
  engine(P, S, '2.0d-190', 'DETA', 190, ['DETA']),
  fuelPumpHP(P, S, '2.0d-190'),
  injectorsDiesel(P, S, '2.0d-190'),
  // === Transmissions ===
  transmission(P, S, 'mt', 'МКПП 6-ступ (0A6)', ['0A6']),
  transmission(P, S, 'robot', 'S-tronic 7-ступ (DL501)', ['0B5']),
  transmission(P, S, 'at', 'Tiptronic 8-ступ (ZF 8HP)', ['0BK']),

  // === Drivetrain (AWD only) ===
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (8R) (2008-2017)',
    slug: '8r',
    yearStart: 2008,
    yearEnd: 2017,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-180', 'engine:2.0-211', 'engine:2.0-225', 'engine:2.0-230',
      'engine:3.2-270', 'engine:3.0-272',
      'engine:2.0d-170', 'engine:2.0d-177', 'engine:3.0d-240', 'engine:3.0d-245',
      'transmission:mt', 'transmission:robot', 'transmission:at',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (FY) (2016-2022)',
    slug: 'fy',
    yearStart: 2016,
    yearEnd: 2022,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-249',
      'engine:2.0d-190',
      'transmission:robot', 'transmission:at',
      'drivetrain:awd',
    ],
  },
]

export const audiQ5Seed = {
  brand: {
    name: 'Audi',
    slug: 'audi',
    logo: null,
    sortOrder: 2,
  },

  model: {
    name: 'Q5',
    slug: 'q5',
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
