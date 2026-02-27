import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import {
  engine, starter, alternator, transmission, ecuTransmission,
  drivetrainFWD,
} from './builders'

const P = 'mitsubishi-lancer'
const S = ['lancer', 'ланцер', 'лансер', 'митсубиси лансер']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === CY engines (Lancer X, 2007-2016) ===
  engine(P, S, '1.5-109', '4A91', 109),
  starter(P, S, '1.5-109', '4A91'),
  alternator(P, S, '1.5-109', '4A91'),

  engine(P, S, '1.6-117', '4A92', 117),
  starter(P, S, '1.6-117', '4A92'),
  alternator(P, S, '1.6-117', '4A92'),

  engine(P, S, '1.8-143', '4B10', 143),
  starter(P, S, '1.8-143', '4B10'),
  alternator(P, S, '1.8-143', '4B10'),

  engine(P, S, '2.0-150', '4B11', 150, ['4B11']),
  starter(P, S, '2.0-150', '4B11'),
  alternator(P, S, '2.0-150', '4B11'),

  // === CS engines (Lancer IX / Cedia, 2000-2010) ===
  engine(P, S, '1.3-82', '4G13', 82),
  starter(P, S, '1.3-82', '4G13'),
  alternator(P, S, '1.3-82', '4G13'),

  engine(P, S, '1.5-100', '4G15', 100),
  starter(P, S, '1.5-100', '4G15'),
  alternator(P, S, '1.5-100', '4G15'),

  engine(P, S, '1.6-98', '4G18', 98),
  starter(P, S, '1.6-98', '4G18'),
  alternator(P, S, '1.6-98', '4G18'),

  engine(P, S, '1.8-125', '4G93', 125),
  starter(P, S, '1.8-125', '4G93'),
  alternator(P, S, '1.8-125', '4G93'),

  engine(P, S, '2.0-135', '4G63', 135),
  starter(P, S, '2.0-135', '4G63'),
  alternator(P, S, '2.0-135', '4G63'),

  engine(P, S, '2.4-162', '4G69', 162),
  starter(P, S, '2.4-162', '4G69'),
  alternator(P, S, '2.4-162', '4G69'),

  // === CK engines (Lancer VIII, 1996-2001) ===
  engine(P, S, '1.3-75', '4G13', 75),
  starter(P, S, '1.3-75', '4G13'),
  alternator(P, S, '1.3-75', '4G13'),

  engine(P, S, '1.6-90', '4G92', 90),
  starter(P, S, '1.6-90', '4G92'),
  alternator(P, S, '1.6-90', '4G92'),

  // === Transmissions ===
  transmission(P, S, 'mt5', 'МКПП 5-ступ', ['F5M42']),
  transmission(P, S, 'at4', 'АКПП 4-ступ (F4A42)', ['F4A42']),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'cvt-jf011e', 'Вариатор (Jatco JF011E)', ['JF011E']),
  ecuTransmission(P, S, 'cvt-jf011e'),

  // === Drivetrain ===
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'X (CY) (2007-2016)',
    slug: 'cy',
    yearStart: 2007,
    yearEnd: 2016,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.5-109',
      'engine:1.6-117',
      'engine:1.8-143',
      'engine:2.0-150',
      'transmission:mt5',
      'transmission:at4',
      'transmission:cvt-jf011e',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'IX (CS) (2000-2010)',
    slug: 'cs',
    yearStart: 2000,
    yearEnd: 2010,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.3-82',
      'engine:1.5-100',
      'engine:1.6-98',
      'engine:1.8-125',
      'engine:2.0-135',
      'engine:2.4-162',
      'transmission:mt5',
      'transmission:at4',
      'transmission:cvt-jf011e',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'VIII (CK) (1996-2001)',
    slug: 'ck',
    yearStart: 1996,
    yearEnd: 2001,
    bodyType: 'sedan' as BodyType,
    isActive: false,
    availableConfigs: [
      'engine:1.3-75',
      'engine:1.6-90',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:fwd',
    ],
  },
]

export const mitsubishiLancerSeed = {
  brand: {
    name: 'Mitsubishi',
    slug: 'mitsubishi',
    logo: 'M12 1.65L16.1 8.6L12 15.55L7.9 8.65ZM12 15.25L20 15.25L24 22.05L16 22.05ZM12 15.25L4 15.25L0 22.05L8 22.05Z',
    sortOrder: 14,
  },

  model: {
    name: 'Lancer',
    slug: 'lancer',
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
