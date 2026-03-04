import { BodyType, PartCategory } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { isSharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import {
  engine,
  starter,
  alternator,
  fuelPumpHP,
  injectorsDiesel,
  turbo,
  intercooler,
  transmission,
  ecuTransmission,
  drivetrainAWD,
} from './builders'

const P = 'toyota-land-cruiser-prado'
const S = ['land cruiser prado', 'ленд крузер прадо', 'прадо', 'prado', 'lc prado']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === 2.7 2TR-FE (163 л.с.) — бензин MPI ===
  engine(P, S, '2.7-163', '2TR-FE', 163, ['1900075G20']),
  starter(P, S, '2.7-163'),
  alternator(P, S, '2.7-163'),

  // === 3.0D 1KD-FTV (173 л.с.) — дизель турбо ===
  engine(P, S, '3.0d-173', '1KD-FTV', 173, ['1900030670']),
  starter(P, S, '3.0d-173'),
  alternator(P, S, '3.0d-173'),
  fuelPumpHP(P, S, '3.0d-173'),
  injectorsDiesel(P, S, '3.0d-173'),
  turbo(P, S, '3.0d-173', '1KD-FTV'),
  intercooler(P, S, '3.0d-173'),

  // === 2.8D 1GD-FTV (177 л.с.) — дизель турбо ===
  engine(P, S, '2.8d-177', '1GD-FTV', 177, ['1900011A40']),
  starter(P, S, '2.8d-177'),
  alternator(P, S, '2.8d-177'),
  fuelPumpHP(P, S, '2.8d-177'),
  injectorsDiesel(P, S, '2.8d-177'),
  turbo(P, S, '2.8d-177', '1GD-FTV'),
  intercooler(P, S, '2.8d-177'),

  // === 4.0 1GR-FE (249 л.с.) — бензин MPI, SHARED с LC200 ===
  engine(P, S, '4.0-249', '1GR-FE', 249, ['1900031A41']),
  starter(P, S, '4.0-249'),
  alternator(P, S, '4.0-249'),

  // === 4.0 1GR-FE (282 л.с.) — бензин MPI ===
  engine(P, S, '4.0-282', '1GR-FE', 282, ['1900031K61']),
  starter(P, S, '4.0-282'),
  alternator(P, S, '4.0-282'),

  // === Трансмиссии ===
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at4', 'АКПП 4-ступ A340F'),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'at5', 'АКПП 5-ступ A750F'),
  ecuTransmission(P, S, 'at5'),
  transmission(P, S, 'at6', 'АКПП 6-ступ'),
  ecuTransmission(P, S, 'at6'),

  // === Привод — AWD ===
  ...drivetrainAWD(P, S),

  // === Рама (рамная конструкция) ===
  {
    name: 'Рама',
    slug: `${P}-frame`,
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    searchQueries: S.map((name) => `рама ${name}`),
  },

  // === Трансмиссия AWD ===
  {
    name: 'Кардан передний',
    slug: `${P}-front-driveshaft`,
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    searchQueries: S.map((name) => `кардан передний ${name}`),
  },
  {
    name: 'Редуктор передний',
    slug: `${P}-front-diff`,
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    searchQueries: [
      ...S.map((name) => `редуктор передний ${name}`),
      ...S.map((name) => `передний мост ${name}`),
    ],
  },

  // === Рычаги подвески (двухрычажная передняя / многорычажная задняя) ===
  {
    name: 'Рычаг верхний передний левый',
    slug: `${P}-arm-upper-fl`,
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    searchQueries: S.map((name) => `рычаг верхний передний левый ${name}`),
  },
  {
    name: 'Рычаг верхний передний правый',
    slug: `${P}-arm-upper-fr`,
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    searchQueries: S.map((name) => `рычаг верхний передний правый ${name}`),
  },
  {
    name: 'Рычаг нижний передний левый',
    slug: `${P}-arm-lower-fl`,
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    searchQueries: S.map((name) => `рычаг нижний передний левый ${name}`),
  },
  {
    name: 'Рычаг нижний передний правый',
    slug: `${P}-arm-lower-fr`,
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    searchQueries: S.map((name) => `рычаг нижний передний правый ${name}`),
  },
  {
    name: 'Рычаг задний левый',
    slug: `${P}-arm-rear-l`,
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    searchQueries: S.map((name) => `рычаг задний левый ${name}`),
  },
  {
    name: 'Рычаг задний правый',
    slug: `${P}-arm-rear-r`,
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    searchQueries: S.map((name) => `рычаг задний правый ${name}`),
  },
]

const generations: GenerationData[] = [
  {
    name: 'IV (J150) (2009-2023)',
    slug: 'j150',
    yearStart: 2009,
    yearEnd: 2023,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.7-163',
      'engine:3.0d-173',
      'engine:2.8d-177',
      'engine:4.0-282',
      'transmission:mt5',
      'transmission:mt6',
      'transmission:at4',
      'transmission:at5',
      'transmission:at6',
      'drivetrain:awd',
    ],
  },
  {
    name: 'III (J120) (2002-2009)',
    slug: 'j120',
    yearStart: 2002,
    yearEnd: 2009,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.7-163',
      'engine:3.0d-173',
      'engine:4.0-249',
      'transmission:mt5',
      'transmission:at4',
      'transmission:at5',
      'drivetrain:awd',
    ],
  },
]

export const toyotaLandCruiserPradoSeed = {
  brand: {
    name: 'Toyota',
    slug: 'toyota',
    logo: 'M12 3.848C5.223 3.848 0 7.298 0 12c0 4.702 5.224 8.152 12 8.152S24 16.702 24 12c0-4.702-5.223-8.152-12-8.152zm7.334 3.839c0 1.08-1.725 1.913-4.488 2.246-.26-2.58-1.005-4.279-1.963-4.913 2.948.184 6.45 1.227 6.45 2.667zM12 16.401c-.96 0-1.746-1.5-1.808-4.389.577.047 1.18.072 1.808.072.628 0 1.23-.025 1.807-.072-.061 2.89-.847 4.389-1.807 4.389zm0-6.308c-.59 0-1.155-.019-1.69-.054.261-1.728.92-3.15 1.69-3.15.77 0 1.428 1.422 1.689 3.15-.535.034-1.099.054-1.689.054zm-.882-5.075c-.956.633-1.706 2.333-1.964 4.915C6.391 9.6 4.665 8.767 4.665 7.687c0-1.44 3.504-2.49 6.453-2.669zM2.037 11.68a5.265 5.265 0 011.048-3.164c.27 1.547 2.522 2.881 5.972 3.37V12c0 3.772.879 6.203 2.087 6.97-5.107-.321-9.107-3.48-9.107-7.29zm10.823 7.29c1.207-.767 2.087-3.198 2.087-6.97v-.115c3.447-.488 5.704-1.826 5.972-3.37a5.26 5.26 0 011.049 3.165c-.004 3.81-4.008 6.969-9.109 7.29z',
    sortOrder: 11,
  },

  model: {
    name: 'Land Cruiser Prado',
    slug: 'land-cruiser-prado',
    isPopular: true,
    sortOrder: 4,
  },

  generations,

  getPartsForGeneration(generation: GenerationData): (PartData | SharedPartRef)[] {
    const allParts = [...getBaseParts(P, S), ...modelSpecificParts]

    return allParts.filter((part) => {
      if (!isSharedPartRef(part) && part.slug === `${P}-rear-beam`) return false
      if (!isSharedPartRef(part) && part.slug === `${P}-subframe-r`) return false
      if (!part.configGroup) return true
      if (!generation.availableConfigs) return true
      return generation.availableConfigs.includes(part.configGroup)
    })
  },
}
