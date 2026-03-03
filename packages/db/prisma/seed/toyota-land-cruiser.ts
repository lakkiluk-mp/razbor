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

const P = 'toyota-land-cruiser'
const S = ['toyota land cruiser', 'тойота ленд крузер', 'ленд крузер', 'land cruiser', 'landcruiser', 'lc']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === J300: 3.4T V35A-FTS (415 л.с.) — бензин biturbo ===
  engine(P, S, '3.4t-415', 'V35A-FTS', 415, ['1900052060']),
  starter(P, S, '3.4t-415'),
  alternator(P, S, '3.4t-415'),
  fuelPumpHP(P, S, '3.4t-415'),
  turbo(P, S, '3.4t-415', 'V35A-FTS', undefined, 'left'),
  turbo(P, S, '3.4t-415', 'V35A-FTS', undefined, 'right'),
  intercooler(P, S, '3.4t-415'),

  // === J300: 3.3D F33A-FTV (299 л.с.) — дизель турбо ===
  engine(P, S, '3.3d-299', 'F33A-FTV', 299, ['1900052063']),
  starter(P, S, '3.3d-299'),
  alternator(P, S, '3.3d-299'),
  fuelPumpHP(P, S, '3.3d-299'),
  injectorsDiesel(P, S, '3.3d-299'),
  turbo(P, S, '3.3d-299', 'F33A-FTV'),
  intercooler(P, S, '3.3d-299'),

  // === J200: 4.0 1GR-FE (249 л.с.) — бензин MPI, GRJ200 ===
  engine(P, S, '4.0-249', '1GR-FE', 249, ['1900031A41']),
  starter(P, S, '4.0-249'),
  alternator(P, S, '4.0-249'),

  // === J200: 4.7 2UZ-FE (288 л.с.) — бензин MPI ===
  engine(P, S, '4.7-288', '2UZ-FE', 288, ['1900050790']),
  starter(P, S, '4.7-288'),
  alternator(P, S, '4.7-288'),

  // === J200: 4.5D 1VD-FTV (235 л.с.) — дизель турбо ===
  engine(P, S, '4.5d-235', '1VD-FTV', 235, ['1900051100']),
  starter(P, S, '4.5d-235'),
  alternator(P, S, '4.5d-235'),
  fuelPumpHP(P, S, '4.5d-235'),
  injectorsDiesel(P, S, '4.5d-235'),
  turbo(P, S, '4.5d-235', '1VD-FTV'),
  intercooler(P, S, '4.5d-235'),

  // === J200: 4.5D 1VD-FTV (249 л.с.) — дизель турбо рестайлинг ===
  engine(P, S, '4.5d-249', '1VD-FTV', 249, ['1900051130']),
  starter(P, S, '4.5d-249'),
  alternator(P, S, '4.5d-249'),
  fuelPumpHP(P, S, '4.5d-249'),
  injectorsDiesel(P, S, '4.5d-249'),
  turbo(P, S, '4.5d-249', '1VD-FTV'),
  intercooler(P, S, '4.5d-249'),

  // === J200: 4.6 1UR-FE (309 л.с.) — бензин MPI ===
  engine(P, S, '4.6-309', '1UR-FE', 309, ['1900038570']),
  starter(P, S, '4.6-309'),
  alternator(P, S, '4.6-309'),

  // === J200: 5.7 3UR-FE (381 л.с.) — бензин MPI, URJ200 ===
  engine(P, S, '5.7-381', '3UR-FE', 381, ['1900038640']),
  starter(P, S, '5.7-381'),
  alternator(P, S, '5.7-381'),

  // === J100: 4.2D 1HZ (131 л.с.) — дизель атмосферный ===
  engine(P, S, '4.2d-131', '1HZ', 131, ['1900017690']),
  starter(P, S, '4.2d-131'),
  alternator(P, S, '4.2d-131'),
  fuelPumpHP(P, S, '4.2d-131'),
  injectorsDiesel(P, S, '4.2d-131'),

  // === J100: 4.2TD 1HD-FTE (204 л.с.) — турбодизель ===
  engine(P, S, '4.2td-204', '1HD-FTE', 204),
  starter(P, S, '4.2td-204'),
  alternator(P, S, '4.2td-204'),
  fuelPumpHP(P, S, '4.2td-204'),
  injectorsDiesel(P, S, '4.2td-204'),
  turbo(P, S, '4.2td-204', '1HD-FTE'),
  intercooler(P, S, '4.2td-204'),

  // === J100: 4.5 1FZ-FE (224 л.с.) — бензин MPI ===
  engine(P, S, '4.5-224', '1FZ-FE', 224),
  starter(P, S, '4.5-224'),
  alternator(P, S, '4.5-224'),

  // === J100: 4.7 2UZ-FE (235 л.с.) — бензин MPI ===
  engine(P, S, '4.7-235', '2UZ-FE', 235, ['1900050440']),
  starter(P, S, '4.7-235'),
  alternator(P, S, '4.7-235'),

  // === Трансмиссии ===
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'at5', 'АКПП 5-ступ A750F'),
  ecuTransmission(P, S, 'at5'),
  transmission(P, S, 'at6', 'АКПП 6-ступ AB60F'),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'at10', 'АКПП 10-ступ AC60F'),
  ecuTransmission(P, S, 'at10'),

  // === Привод — AWD (Land Cruiser всегда полный привод) ===
  ...drivetrainAWD(P, S),

  // === Рама (рамная конструкция, унибоди нет) ===
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
    name: 'XII (J300) (2021-2022)',
    slug: 'j300',
    yearStart: 2021,
    yearEnd: 2022,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.4t-415',
      'engine:3.3d-299',
      'transmission:at10',
      'drivetrain:awd',
    ],
  },
  {
    name: 'XI (J200) (2007-2021)',
    slug: 'j200',
    yearStart: 2007,
    yearEnd: 2021,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:4.0-249',
      'engine:4.7-288',
      'engine:4.5d-235',
      'engine:4.5d-249',
      'engine:4.6-309',
      'engine:5.7-381',
      'transmission:at6',
      'drivetrain:awd',
    ],
  },
  {
    name: 'X (J100) (1998-2007)',
    slug: 'j100',
    yearStart: 1998,
    yearEnd: 2007,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:4.2d-131',
      'engine:4.2td-204',
      'engine:4.5-224',
      'engine:4.7-235',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:awd',
    ],
  },
]

export const toyotaLandCruiserSeed = {
  brand: {
    name: 'Toyota',
    slug: 'toyota',
    logo: 'M12 3.848C5.223 3.848 0 7.298 0 12c0 4.702 5.224 8.152 12 8.152S24 16.702 24 12c0-4.702-5.223-8.152-12-8.152zm7.334 3.839c0 1.08-1.725 1.913-4.488 2.246-.26-2.58-1.005-4.279-1.963-4.913 2.948.184 6.45 1.227 6.45 2.667zM12 16.401c-.96 0-1.746-1.5-1.808-4.389.577.047 1.18.072 1.808.072.628 0 1.23-.025 1.807-.072-.061 2.89-.847 4.389-1.807 4.389zm0-6.308c-.59 0-1.155-.019-1.69-.054.261-1.728.92-3.15 1.69-3.15.77 0 1.428 1.422 1.689 3.15-.535.034-1.099.054-1.689.054zm-.882-5.075c-.956.633-1.706 2.333-1.964 4.915C6.391 9.6 4.665 8.767 4.665 7.687c0-1.44 3.504-2.49 6.453-2.669zM2.037 11.68a5.265 5.265 0 011.048-3.164c.27 1.547 2.522 2.881 5.972 3.37V12c0 3.772.879 6.203 2.087 6.97-5.107-.321-9.107-3.48-9.107-7.29zm10.823 7.29c1.207-.767 2.087-3.198 2.087-6.97v-.115c3.447-.488 5.704-1.826 5.972-3.37a5.26 5.26 0 011.049 3.165c-.004 3.81-4.008 6.969-9.109 7.29z',
    sortOrder: 11,
  },

  model: {
    name: 'Land Cruiser',
    slug: 'land-cruiser',
    isPopular: true,
    sortOrder: 3,
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
