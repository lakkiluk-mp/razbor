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
  supercharger,
  transmission,
  ecuTransmission,
  drivetrainAWD,
} from './builders'

const P = 'mercedes-g-class'
const S = ['g class', 'г класс', 'гелендваген', 'гелик', 'g-class']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === W463 Petrol engines ===
  // M112 3.2 V6 215hp (atmo MPI — G 320)
  engine(P, S, '3.2-215', 'M112', 215, ['112941']),
  starter(P, S, '3.2-215'),
  alternator(P, S, '3.2-215'),
  // M113 4.3 V8 279hp (atmo MPI — G 430)
  engine(P, S, '4.3-279', 'M113', 279, ['113941']),
  starter(P, S, '4.3-279'),
  alternator(P, S, '4.3-279'),
  // M113 5.0 V8 306hp (atmo MPI — G 500)
  engine(P, S, '5.0-306', 'M113', 306, ['113960']),
  starter(P, S, '5.0-306'),
  alternator(P, S, '5.0-306'),
  // M113 5.4 V8 AMG 347hp (supercharger — G 55 AMG)
  engine(P, S, '5.4-347', 'M113', 347, ['113981']),
  starter(P, S, '5.4-347'),
  alternator(P, S, '5.4-347'),
  supercharger(P, S, '5.4-347', 'M113'),
  intercooler(P, S, '5.4-347'),
  // M273 5.5 V8 388hp (atmo MPI — G 500 рестайл)
  engine(P, S, '5.5-388', 'M273', 388, ['273961']),
  starter(P, S, '5.5-388'),
  alternator(P, S, '5.5-388'),
  // M157 5.5T V8 525hp (biturbo GDI — G 63 AMG)
  engine(P, S, '5.5-525', 'M157', 525, ['157982']),
  starter(P, S, '5.5-525'),
  alternator(P, S, '5.5-525'),
  fuelPumpHP(P, S, '5.5-525'),
  turbo(P, S, '5.5-525', 'M157', undefined, 'left'),
  turbo(P, S, '5.5-525', 'M157', undefined, 'right'),
  intercooler(P, S, '5.5-525'),
  // M156 6.2 V8 AMG 510hp (atmo — G 63 AMG дорестайл)
  engine(P, S, '6.2-510', 'M156', 510, ['156985']),
  starter(P, S, '6.2-510'),
  alternator(P, S, '6.2-510'),

  // === W463 Diesel engines ===
  // OM612 2.7 CDI 163hp (G 270 CDI)
  engine(P, S, '2.7d-163', 'OM612', 163, ['OM612']),
  starter(P, S, '2.7d-163'),
  alternator(P, S, '2.7d-163'),
  fuelPumpHP(P, S, '2.7d-163'),
  injectorsDiesel(P, S, '2.7d-163'),
  turbo(P, S, '2.7d-163', 'OM612'),
  intercooler(P, S, '2.7d-163'),
  // OM642 3.0 V6 CDI 224hp (G 320 CDI / G 350 CDI)
  engine(P, S, '3.0d-224', 'OM642', 224, ['OM642']),
  starter(P, S, '3.0d-224'),
  alternator(P, S, '3.0d-224'),
  fuelPumpHP(P, S, '3.0d-224'),
  injectorsDiesel(P, S, '3.0d-224'),
  turbo(P, S, '3.0d-224', 'OM642'),
  intercooler(P, S, '3.0d-224'),

  // === W463 new Petrol engines ===
  // M176 4.0 V8 422hp (biturbo GDI — G 500 new)
  engine(P, S, '4.0-422', 'M176', 422),
  starter(P, S, '4.0-422'),
  alternator(P, S, '4.0-422'),
  fuelPumpHP(P, S, '4.0-422'),
  turbo(P, S, '4.0-422', 'M176', undefined, 'left'),
  turbo(P, S, '4.0-422', 'M176', undefined, 'right'),
  intercooler(P, S, '4.0-422'),
  // M177 4.0T V8 AMG 585hp (biturbo GDI — G 63 AMG new)
  engine(P, S, '4.0-585', 'M177', 585, ['177980']),
  starter(P, S, '4.0-585'),
  alternator(P, S, '4.0-585'),
  fuelPumpHP(P, S, '4.0-585'),
  turbo(P, S, '4.0-585', 'M177', undefined, 'left'),
  turbo(P, S, '4.0-585', 'M177', undefined, 'right'),
  intercooler(P, S, '4.0-585'),

  // === W463 new Diesel engines ===
  // OM656 3.0 I6 286hp (дизель турбо — G 400d)
  engine(P, S, '3.0d-286', 'OM656', 286),
  starter(P, S, '3.0d-286'),
  alternator(P, S, '3.0d-286'),
  fuelPumpHP(P, S, '3.0d-286'),
  injectorsDiesel(P, S, '3.0d-286'),
  turbo(P, S, '3.0d-286', 'OM656'),
  intercooler(P, S, '3.0d-286'),

  // === Transmissions ===
  transmission(P, S, 'at5', 'АКПП 5-ступ', ['722.6']),
  ecuTransmission(P, S, 'at5'),
  transmission(P, S, 'at7', 'АКПП 7-ступ', ['722.9']),
  ecuTransmission(P, S, 'at7'),
  transmission(P, S, 'at9', 'АКПП 9-ступ', ['725.0']),
  ecuTransmission(P, S, 'at9'),

  // === Drivetrain — AWD (G-Class всегда полный привод) ===
  ...drivetrainAWD(P, S),

  // === Рама (рамная конструкция, как Land Cruiser) ===
  {
    name: 'Рама',
    slug: `${P}-frame`,
    category: 'suspension' as PartCategory,
    schematicZoneCode: null,
    searchQueries: S.map((name) => `рама ${name}`),
  },

  // === Трансмиссия AWD (рамный) ===
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

]

const generations: GenerationData[] = [
  {
    name: 'II (W463) (2018-н.в.)',
    slug: 'w463-new',
    yearStart: 2018,
    yearEnd: null,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:4.0-422',
      'engine:4.0-585',
      'engine:3.0d-286',
      'transmission:at9',
      'drivetrain:awd',
    ],
  },
  {
    name: 'I (W463) (1997-2018)',
    slug: 'w463',
    yearStart: 1997,
    yearEnd: 2018,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.2-215',
      'engine:4.3-279',
      'engine:5.0-306',
      'engine:5.4-347',
      'engine:5.5-388',
      'engine:5.5-525',
      'engine:6.2-510',
      'engine:2.7d-163',
      'engine:3.0d-224',
      'transmission:at5',
      'transmission:at7',
      'drivetrain:awd',
    ],
  },
]

export const mercedesGClassSeed = {
  brand: {
    name: 'Mercedes-Benz',
    slug: 'mercedes-benz',
    logo: 'M17.58,1.35C15.9,0.48,14.01,0,12,0c-2.01,0-3.9,0.48-5.58,1.35v0C2.61,3.36,0,7.38,0,12c0,4.62,2.61,8.64,6.45,10.65C8.1,23.49,9.99,24,12,24c2.01,0,3.87-0.51,5.55-1.38C21.39,20.64,24,16.62,24,12C24,7.38,21.39,3.36,17.58,1.35z M1.2,12c0-3.93,2.1-7.35,5.25-9.27v0C7.98,1.8,9.75,1.26,11.7,1.2l-1.35,9.81L6.45,14.04v0L2.49,17.13C1.68,15.6,1.2,13.86,1.2,12z M17.58,21.24C15.93,22.23,14.04,22.8,12,22.8c-2.04,0-3.96-0.57-5.58-1.56c-1.47-0.87-2.67-2.07-3.57-3.51l3.57-1.47v0L12,13.98l5.58,2.25v0l3.6,1.47C20.28,19.17,19.02,20.37,17.58,21.24z M17.58,14.04L17.58,14.04l-3.87-3L12.33,1.2c1.89,0.06,3.69,0.6,5.22,1.53v0C20.7,4.62,22.8,8.07,22.8,12c0,1.86-0.45,3.6-1.29,5.13L17.58,14.04z',
    sortOrder: 3,
  },

  model: {
    name: 'G-Class',
    slug: 'g-class',
    isPopular: false,
    sortOrder: 5,
  },

  generations,

  getPartsForGeneration(generation: GenerationData): (PartData | SharedPartRef)[] {
    const allParts = [...getBaseParts(P, S), ...modelSpecificParts]

    return allParts.filter((part) => {
      if (!isSharedPartRef(part) && part.slug === `${P}-rear-beam`) return false
      if (!isSharedPartRef(part) && part.slug === `${P}-subframe-r`) return false
      if (!isSharedPartRef(part) && part.slug === `${P}-subframe-f`) return false
      if (!part.configGroup) return true
      if (!generation.availableConfigs) return true
      return generation.availableConfigs.includes(part.configGroup)
    })
  },
}
