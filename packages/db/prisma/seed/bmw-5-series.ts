import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainRWD, drivetrainAWD, fuelPumpHP, injectorsDiesel } from './builders'

const P = 'bmw-5-series'
const S = ['5 series', '5 серия', '5 серии', 'бмв 5']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === E39 engines (MPI — без ТНВД) ===
  engine(P, S, '2.8-193', 'M52B28', 193, ['M52B28']),
  engine(P, S, '2.5-192', 'M54B25', 192, ['M54B25']),
  engine(P, S, '3.0-231', 'M54B30', 231, ['M54B30']),

  // E39 diesel (ТНВД + форсунки)
  engine(P, S, '3.0d-193', 'M57D30', 193, ['M57D30']),
  fuelPumpHP(P, S, '3.0d-193'),
  injectorsDiesel(P, S, '3.0d-193'),

  // === E60 engines (MPI — без ТНВД) ===
  engine(P, S, '2.5-218', 'N52B25', 218, ['N52B25']),
  engine(P, S, '3.0-258', 'N52B30', 258, ['N52B30']),

  // E60 GDI turbo (ТНВД)
  engine(P, S, '3.0t-272', 'N54B30', 272, ['N54B30']),
  fuelPumpHP(P, S, '3.0t-272'),

  // E60 diesel (ТНВД + форсунки)
  engine(P, S, '3.0d-231', 'M57D30', 231, ['M57D30']),
  fuelPumpHP(P, S, '3.0d-231'),
  injectorsDiesel(P, S, '3.0d-231'),

  // === F10 engines (все GDI — ТНВД) ===
  engine(P, S, '2.0t-184', 'N20B20', 184, ['N20B20']),
  fuelPumpHP(P, S, '2.0t-184'),
  engine(P, S, '2.0t-245', 'N20B20', 245, ['N20B20']),
  fuelPumpHP(P, S, '2.0t-245'),
  engine(P, S, '3.0t-306', 'N55B30', 306, ['N55B30']),
  fuelPumpHP(P, S, '3.0t-306'),
  engine(P, S, '4.4t-407', 'N63B44', 407, ['N63B44']),
  fuelPumpHP(P, S, '4.4t-407'),

  // F10 diesel (ТНВД + форсунки)
  engine(P, S, '3.0d-245', 'N57D30', 245, ['N57D30']),
  fuelPumpHP(P, S, '3.0d-245'),
  injectorsDiesel(P, S, '3.0d-245'),

  // === Transmissions ===
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'at5', 'АКПП 5-ступ ZF 5HP19', ['5HP19']),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at6', 'АКПП 6-ступ ZF 6HP19', ['6HP19']),
  transmission(P, S, 'at8', 'АКПП 8-ступ ZF 8HP45', ['8HP45']),

  // === Drivetrain ===
  ...drivetrainRWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'VI (F10/F11) (2009-2017)',
    slug: 'f10',
    yearStart: 2009,
    yearEnd: 2017,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0t-184',
      'engine:2.0t-245',
      'engine:3.0t-306',
      'engine:4.4t-407',
      'engine:3.0d-245',
      'transmission:at8',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'V (E60/E61) (2003-2010)',
    slug: 'e60',
    yearStart: 2003,
    yearEnd: 2010,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.5-218',
      'engine:3.0-258',
      'engine:3.0t-272',
      'engine:3.0d-231',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'IV (E39) (1995-2003)',
    slug: 'e39',
    yearStart: 1995,
    yearEnd: 2003,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.8-193',
      'engine:2.5-192',
      'engine:3.0-231',
      'engine:3.0d-193',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:rwd',
    ],
  },
]

export const bmw5SeriesSeed = {
  brand: {
    name: 'BMW',
    slug: 'bmw',
    logo: null,
    sortOrder: 4,
  },

  model: {
    name: '5 Series',
    slug: '5-series',
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
