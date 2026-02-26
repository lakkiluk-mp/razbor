import { BodyType } from '@prisma/client'
import type { PartData, GenerationData } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, drivetrainFWD } from './builders'

const P = 'chevrolet-lanos'
const S = ['lanos', 'ланос', 'шевроле ланос', 'chevrolet lanos']

const modelSpecificParts: PartData[] = [
  engine(P, S, '1.5-86', 'A15SMS', 86),
  starter(P, S, '1.5-86', 'A15SMS'),
  alternator(P, S, '1.5-86', 'A15SMS'),

  transmission(P, S, 'mt5', 'МКПП 5-ступ'),

  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'T100 (2005-2009)',
    slug: 't100',
    yearStart: 2005,
    yearEnd: 2009,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.5-86',
      'transmission:mt5',
      'drivetrain:fwd',
    ],
  },
]

export const chevroletLanosSeed = {
  brand: {
    name: 'Chevrolet',
    slug: 'chevrolet',
    logo: 'M23.905 9.784H15.92V8.246a.157.157 0 00-.157-.158H8.238a.157.157 0 00-.157.158v1.538H2.358c-.087 0-.193.07-.237.158L.02 14.058c-.045.088-.011.157.077.157H8.08v1.54c0 .086.07.157.157.157h7.525c.087 0 .157-.07.157-.157v-1.54h5.723c.087 0 .193-.07.238-.157l2.1-4.116c.045-.087.011-.158-.076-.158m-2.494.996l-1.244 2.437h-5.232v1.708H9.07v-1.708H2.595L3.84 10.78h5.232V9.073h5.864v1.707z',
    sortOrder: 20,
  },
  model: {
    name: 'Lanos',
    slug: 'lanos',
    isPopular: false,
    sortOrder: 2,
  },
  generations,
  getPartsForGeneration(generation: GenerationData): PartData[] {
    const allParts = [...getBaseParts(P, S), ...modelSpecificParts]
    return allParts.filter((part) => {
      if (!part.configGroup) return true
      if (!generation.availableConfigs) return true
      return generation.availableConfigs.includes(part.configGroup)
    })
  },
}
