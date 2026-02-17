import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainAWD, fuelPumpHP, injectorsDiesel } from './builders'

const P = 'porsche-cayenne'
const S = ['cayenne', 'кайен']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === 9PA engines (955 + 957 merged) ===
  engine(P, S, '3.2-250', 'M02.2Y', 250, ['95510003401']),
  engine(P, S, '3.6-290', 'M55.01', 290, ['95510093701']),
  engine(P, S, '4.5-340', 'M48.00', 340, ['94810094800']),
  engine(P, S, '4.5-450', 'M48.50', 450, ['94810095042']),
  engine(P, S, '4.8-385', 'M48.01', 385, ['94810094860']),
  fuelPumpHP(P, S, '4.8-385'),
  engine(P, S, '4.8-500', 'M48.51', 500, ['94810095160']),
  fuelPumpHP(P, S, '4.8-500'),
  engine(P, S, '3.0d-240', 'M05.9D', 240),
  fuelPumpHP(P, S, '3.0d-240'),
  injectorsDiesel(P, S, '3.0d-240'),

  // === 92A engines (958 base + restyling merged) ===
  engine(P, S, '3.6-300', 'M55.02', 300, ['95810095501']),
  engine(P, S, '4.8-400', 'M48.02', 400, ['94810090360']),
  fuelPumpHP(P, S, '4.8-400'),
  engine(P, S, '4.8-500-turbo', 'M48.52', 500, ['94810095200']),
  fuelPumpHP(P, S, '4.8-500-turbo'),
  engine(P, S, '3.0d-245', 'MCR.CA', 245, ['95810101121']),
  fuelPumpHP(P, S, '3.0d-245'),
  injectorsDiesel(P, S, '3.0d-245'),
  engine(P, S, '4.1d-382', 'MCU.DB', 382, ['95810095700']),
  fuelPumpHP(P, S, '4.1d-382'),
  injectorsDiesel(P, S, '4.1d-382'),

  // === PO536 engines (E3 base + restyling merged) ===
  engine(P, S, '3.0-340', 'MDC.BE', 340, ['95810002201']),
  fuelPumpHP(P, S, '3.0-340'),
  engine(P, S, '2.9-440', 'MDC.AB', 440, ['PAC100032']),
  fuelPumpHP(P, S, '2.9-440'),
  engine(P, S, '4.0-460', 'MDC.UA', 460, ['95810002100']),
  fuelPumpHP(P, S, '4.0-460'),
  engine(P, S, '4.0-550', 'MDC.UB', 550),
  fuelPumpHP(P, S, '4.0-550'),

  // === КПП ===
  transmission(P, S, 'at6', 'Tiptronic 6-ступ (09D)', ['09D300037G']),
  transmission(P, S, 'at8', 'Tiptronic 8-ступ (ZF 8HP)', ['95830001113']),

  // === Привод ===
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (9PA) (2002-2010)',
    slug: '9pa',
    yearStart: 2002,
    yearEnd: 2010,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.2-250', 'engine:3.6-290', 'engine:4.5-340', 'engine:4.5-450',
      'engine:4.8-385', 'engine:4.8-500', 'engine:3.0d-240',
      'transmission:at6',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (92A) (2010-2018)',
    slug: '92a',
    yearStart: 2010,
    yearEnd: 2018,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.6-300', 'engine:4.8-400', 'engine:4.8-500-turbo',
      'engine:3.0d-245', 'engine:4.1d-382',
      'transmission:at8',
      'drivetrain:awd',
    ],
  },
  {
    name: 'III (E3) (2017-2024)',
    slug: 'po536',
    yearStart: 2017,
    yearEnd: 2024,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.0-340', 'engine:2.9-440', 'engine:4.0-460', 'engine:4.0-550',
      'transmission:at8',
      'drivetrain:awd',
    ],
  },
]

export const porscheCayenneSeed = {
  brand: {
    name: 'Porsche',
    slug: 'porsche',
    logo: null,
    sortOrder: 5,
  },

  model: {
    name: 'Cayenne',
    slug: 'cayenne',
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
