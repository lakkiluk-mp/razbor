import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainRWD, drivetrainAWD, fuelPumpHP, injectorsDiesel, turbo } from './builders'

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
  turbo(P, S, '3.0d-193', 'M57D30'),

  // === E60 engines (MPI — без ТНВД) ===
  engine(P, S, '2.5-218', 'N52B25', 218, ['N52B25']),
  engine(P, S, '3.0-258', 'N52B30', 258, ['N52B30']),

  // E60 GDI turbo (ТНВД)
  engine(P, S, '3.0t-272', 'N54B30', 272, ['N54B30']),
  fuelPumpHP(P, S, '3.0t-272'),
  turbo(P, S, '3.0t-272', 'N54B30', undefined, 'left'),
  turbo(P, S, '3.0t-272', 'N54B30', undefined, 'right'),

  // E60 diesel (ТНВД + форсунки)
  engine(P, S, '3.0d-231', 'M57D30', 231, ['M57D30']),
  fuelPumpHP(P, S, '3.0d-231'),
  injectorsDiesel(P, S, '3.0d-231'),
  turbo(P, S, '3.0d-231', 'M57D30'),

  // === F10 engines (все GDI — ТНВД) ===
  engine(P, S, '2.0t-184', 'N20B20', 184, ['N20B20']),
  fuelPumpHP(P, S, '2.0t-184'),
  turbo(P, S, '2.0t-184', 'N20B20'),
  engine(P, S, '2.0t-245', 'N20B20', 245, ['N20B20']),
  fuelPumpHP(P, S, '2.0t-245'),
  turbo(P, S, '2.0t-245', 'N20B20'),
  engine(P, S, '3.0t-306', 'N55B30', 306, ['N55B30']),
  fuelPumpHP(P, S, '3.0t-306'),
  turbo(P, S, '3.0t-306', 'N55B30'),
  engine(P, S, '4.4t-407', 'N63B44', 407, ['N63B44']),
  fuelPumpHP(P, S, '4.4t-407'),
  turbo(P, S, '4.4t-407', 'N63B44', undefined, 'left'),
  turbo(P, S, '4.4t-407', 'N63B44', undefined, 'right'),

  // F10 diesel (ТНВД + форсунки)
  engine(P, S, '3.0d-245', 'N57D30', 245, ['N57D30']),
  fuelPumpHP(P, S, '3.0d-245'),
  injectorsDiesel(P, S, '3.0d-245'),
  turbo(P, S, '3.0d-245', 'N57D30'),

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
    logo: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 .78C18.196.78 23.219 5.803 23.219 12c0 6.196-5.022 11.219-11.219 11.219C5.803 23.219.781 18.196.781 12S5.804.78 12 .78zm-.678.63c-.33.014-.66.042-.992.078l-.107 2.944a9.95 9.95 0 0 1 .71-.094l.07-1.988-.013-.137.043.13.664 1.489h.606l.664-1.488.04-.131-.01.137.07 1.988c.232.022.473.054.71.094l-.109-2.944a14.746 14.746 0 0 0-.992-.078l-.653 1.625-.023.12-.023-.12-.655-1.625zm6.696 1.824l-1.543 2.428c.195.15.452.371.617.522l1.453-.754.092-.069-.069.094-.752 1.453c.163.175.398.458.53.63l2.43-1.544a16.135 16.135 0 0 0-.46-.568L18.777 6.44l-.105.092.078-.115.68-1.356-.48-.48-1.356.68-.115.078.091-.106 1.018-1.539c-.18-.152-.351-.291-.57-.46zM5.5 3.785c-.36.037-.638.283-1.393 1.125a18.97 18.97 0 0 0-.757.914l2.074 1.967c.687-.76.966-1.042 1.508-1.613.383-.405.6-.87.216-1.317-.208-.242-.558-.295-.85-.175l-.028.01.01-.026a.7.7 0 0 0-.243-.734.724.724 0 0 0-.537-.15zm.006.615c.136-.037.277.06.308.2.032.14-.056.272-.154.382-.22.25-1.031 1.098-1.031 1.098l-.402-.383c.417-.51.861-.974 1.062-1.158a.55.55 0 0 1 .217-.139zM12 4.883a7.114 7.114 0 0 0-7.08 6.388v.002a7.122 7.122 0 0 0 8.516 7.697 7.112 7.112 0 0 0 5.68-6.97A7.122 7.122 0 0 0 12 4.885v-.002zm-5.537.242c.047 0 .096.013.14.043.088.059.128.16.106.26-.026.119-.125.231-.205.318l-1.045 1.12-.42-.4s.787-.832 1.045-1.099c.102-.106.168-.17.238-.205a.331.331 0 0 1 .14-.037zM12 5.818A6.175 6.175 0 0 1 18.182 12H12v6.182A6.175 6.175 0 0 1 5.818 12H12V5.818Z',
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
