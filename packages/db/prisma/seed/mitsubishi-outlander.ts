import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import {
  engine, starter, alternator, transmission, ecuTransmission,
  fuelPumpHP, injectorsDiesel, turbo, intercooler,
  drivetrainFWD, drivetrainAWD,
} from './builders'

const P = 'mitsubishi-outlander'
const S = ['outlander', 'аутлендер', 'аутлэндер', 'отлендер']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === CW engines (Outlander XL, 2006-2012) ===
  engine(P, S, '2.0-147', '4B11', 147, ['4B11']),
  starter(P, S, '2.0-147', '4B11'),
  alternator(P, S, '2.0-147', '4B11'),

  engine(P, S, '2.4-170', '4B12', 170),
  starter(P, S, '2.4-170', '4B12'),
  alternator(P, S, '2.4-170', '4B12'),

  engine(P, S, '3.0-220', '6B31', 220),
  starter(P, S, '3.0-220', '6B31'),
  alternator(P, S, '3.0-220', '6B31'),

  // === GF engines (III, 2012-2021) ===
  engine(P, S, '2.0-146', '4J11', 146),
  starter(P, S, '2.0-146', '4J11'),
  alternator(P, S, '2.0-146', '4J11'),

  engine(P, S, '2.4-167', '4J12', 167),
  starter(P, S, '2.4-167', '4J12'),
  alternator(P, S, '2.4-167', '4J12'),

  engine(P, S, '3.0-227', '6B31', 227),
  starter(P, S, '3.0-227', '6B31'),
  alternator(P, S, '3.0-227', '6B31'),

  engine(P, S, '2.3d-150', '4N14', 150),
  starter(P, S, '2.3d-150', '4N14'),
  alternator(P, S, '2.3d-150', '4N14'),
  fuelPumpHP(P, S, '2.3d-150'),
  injectorsDiesel(P, S, '2.3d-150'),
  turbo(P, S, '2.3d-150', '4N14'),
  intercooler(P, S, '2.3d-150'),

  // === Transmissions ===
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'cvt-jf011e', 'Вариатор (Jatco JF011E)', ['JF011E']),
  ecuTransmission(P, S, 'cvt-jf011e'),
  transmission(P, S, 'cvt-jf016e', 'Вариатор (Jatco JF016E)', ['JF016E']),
  ecuTransmission(P, S, 'cvt-jf016e'),
  transmission(P, S, 'at6', 'АКПП 6-ступ'),
  ecuTransmission(P, S, 'at6'),

  // === Drivetrain ===
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'II (CW) Outlander XL (2006-2012)',
    slug: 'cw',
    yearStart: 2006,
    yearEnd: 2012,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-147',
      'engine:2.4-170',
      'engine:3.0-220',
      'transmission:mt5',
      'transmission:cvt-jf011e',
      'transmission:at6',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'III (GF) (2012-2021)',
    slug: 'gf',
    yearStart: 2012,
    yearEnd: 2021,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-146',
      'engine:2.4-167',
      'engine:3.0-227',
      'engine:2.3d-150',
      'transmission:cvt-jf011e',
      'transmission:cvt-jf016e',
      'transmission:at6',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
]

export const mitsubishiOutlanderSeed = {
  brand: {
    name: 'Mitsubishi',
    slug: 'mitsubishi',
    logo: 'M12 1.65L16.1 8.6L12 15.55L7.9 8.65ZM12 15.25L20 15.25L24 22.05L16 22.05ZM12 15.25L4 15.25L0 22.05L8 22.05Z',
    sortOrder: 14,
  },

  model: {
    name: 'Outlander',
    slug: 'outlander',
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
