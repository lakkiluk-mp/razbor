import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainFWD } from './builders'

const P = 'toyota-corolla'
const S = ['toyota corolla', 'тойота королла', 'королла', 'corolla']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.4-97', '4ZZ-FE', 97, ['1900022110']),
  starter(P, S, '1.4-97'),
  alternator(P, S, '1.4-97'),

  engine(P, S, '1.6-109', '3ZZ-FE', 109, ['1900022220']),
  starter(P, S, '1.6-109'),
  alternator(P, S, '1.6-109'),

  engine(P, S, '1.6-124', '1ZR-FE', 124, ['1900037240']),
  starter(P, S, '1.6-124'),
  alternator(P, S, '1.6-124'),

  engine(P, S, '1.6-122', '1ZR-FE', 122, ['1900037240']),
  starter(P, S, '1.6-122'),
  alternator(P, S, '1.6-122'),

  engine(P, S, '1.8-136', '2ZR-FE', 136, ['1900037450']),
  starter(P, S, '1.8-136'),
  alternator(P, S, '1.8-136'),

  engine(P, S, '1.8-140', '2ZR-FAE', 140, ['1900037480']),
  starter(P, S, '1.8-140'),
  alternator(P, S, '1.8-140'),

  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at4-u341e', 'АКПП 4-ступ U341E', ['3050012A60']),
  ecuTransmission(P, S, 'at4-u341e'),
  transmission(P, S, 'at4-u340e', 'АКПП 4-ступ U340E', ['30500-1A700']),
  ecuTransmission(P, S, 'at4-u340e'),
  transmission(P, S, 'robot-mmt', 'Робот MMT'),
  ecuTransmission(P, S, 'robot-mmt'),
  transmission(P, S, 'cvt-k313', 'Вариатор K313', ['3040020110']),
  ecuTransmission(P, S, 'cvt-k313'),
  transmission(P, S, 'cvt-k311', 'Вариатор K311'),
  ecuTransmission(P, S, 'cvt-k311'),

  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'XII (E210) (2018-2024)',
    slug: 'e210',
    yearStart: 2018,
    yearEnd: 2024,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-122',
      'transmission:mt6',
      'transmission:cvt-k311',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'XI (E180) (2012-2019)',
    slug: 'e180',
    yearStart: 2012,
    yearEnd: 2019,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-122',
      'engine:1.8-140',
      'transmission:mt6',
      'transmission:cvt-k313',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'X (E150) (2006-2013)',
    slug: 'e150',
    yearStart: 2006,
    yearEnd: 2013,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-124',
      'engine:1.8-136',
      'transmission:mt6',
      'transmission:at4-u340e',
      'transmission:robot-mmt',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'IX (E120) (2000-2006)',
    slug: 'e120',
    yearStart: 2000,
    yearEnd: 2006,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-97',
      'engine:1.6-109',
      'transmission:mt5',
      'transmission:at4-u341e',
      'drivetrain:fwd',
    ],
  },
]

export const toyotaCorollaSeed = {
  brand: {
    name: 'Toyota',
    slug: 'toyota',
    logo: 'M12 3.848C5.223 3.848 0 7.298 0 12c0 4.702 5.224 8.152 12 8.152S24 16.702 24 12c0-4.702-5.223-8.152-12-8.152zm7.334 3.839c0 1.08-1.725 1.913-4.488 2.246-.26-2.58-1.005-4.279-1.963-4.913 2.948.184 6.45 1.227 6.45 2.667zM12 16.401c-.96 0-1.746-1.5-1.808-4.389.577.047 1.18.072 1.808.072.628 0 1.23-.025 1.807-.072-.061 2.89-.847 4.389-1.807 4.389zm0-6.308c-.59 0-1.155-.019-1.69-.054.261-1.728.92-3.15 1.69-3.15.77 0 1.428 1.422 1.689 3.15-.535.034-1.099.054-1.689.054zm-.882-5.075c-.956.633-1.706 2.333-1.964 4.915C6.391 9.6 4.665 8.767 4.665 7.687c0-1.44 3.504-2.49 6.453-2.669zM2.037 11.68a5.265 5.265 0 011.048-3.164c.27 1.547 2.522 2.881 5.972 3.37V12c0 3.772.879 6.203 2.087 6.97-5.107-.321-9.107-3.48-9.107-7.29zm10.823 7.29c1.207-.767 2.087-3.198 2.087-6.97v-.115c3.447-.488 5.704-1.826 5.972-3.37a5.26 5.26 0 011.049 3.165c-.004 3.81-4.008 6.969-9.109 7.29z',
    sortOrder: 11,
  },

  model: {
    name: 'Corolla',
    slug: 'corolla',
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
