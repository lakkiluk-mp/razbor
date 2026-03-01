import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, fuelPumpHP, transmission, ecuTransmission, drivetrainFWD, turbo, intercooler } from './builders'

const P = 'chevrolet-cruze'
const S = ['cruze', 'круз', 'шевроле круз', 'chevrolet cruze']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.6-109', 'F16D3', 109, ['96475805']),
  starter(P, S, '1.6-109', 'F16D3'),
  alternator(P, S, '1.6-109', 'F16D3'),

  engine(P, S, '1.8-141', 'F18D4', 141),
  starter(P, S, '1.8-141', 'F18D4'),
  alternator(P, S, '1.8-141', 'F18D4'),

  engine(P, S, '1.4t-140', 'A14NET', 140, ['A14NET']),
  starter(P, S, '1.4t-140', 'A14NET'),
  alternator(P, S, '1.4t-140', 'A14NET'),
  fuelPumpHP(P, S, '1.4t-140'),
  turbo(P, S, '1.4t-140', 'A14NET'),
  intercooler(P, S, '1.4t-140'),

  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'at6', 'АКПП 6-ступ (6T30)'),
  ecuTransmission(P, S, 'at6'),

  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'J300 (2008-2015)',
    slug: 'j300',
    yearStart: 2008,
    yearEnd: 2015,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-109', 'engine:1.8-141', 'engine:1.4t-140',
      'transmission:mt5', 'transmission:at4', 'transmission:at6',
      'drivetrain:fwd',
    ],
  },
]

export const chevroletCruzeSeed = {
  brand: {
    name: 'Chevrolet',
    slug: 'chevrolet',
    logo: 'M23.905 9.784H15.92V8.246a.157.157 0 00-.157-.158H8.238a.157.157 0 00-.157.158v1.538H2.358c-.087 0-.193.07-.237.158L.02 14.058c-.045.088-.011.157.077.157H8.08v1.54c0 .086.07.157.157.157h7.525c.087 0 .157-.07.157-.157v-1.54h5.723c.087 0 .193-.07.238-.157l2.1-4.116c.045-.087.011-.158-.076-.158m-2.494.996l-1.244 2.437h-5.232v1.708H9.07v-1.708H2.595L3.84 10.78h5.232V9.073h5.864v1.707z',
    sortOrder: 20,
  },
  model: {
    name: 'Cruze',
    slug: 'cruze',
    isPopular: true,
    sortOrder: 3,
  },
  generations,
  getPartsForGeneration(generation: GenerationData): (PartData | SharedPartRef)[] {
    const allParts = [...getBaseParts(P, S), ...modelSpecificParts]
    return allParts.filter((part) => {
      if (!('configGroup' in part) || !part.configGroup) return true
      if (!generation.availableConfigs) return true
      return generation.availableConfigs.includes(part.configGroup)
    })
  },
}
