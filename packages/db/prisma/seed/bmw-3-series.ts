import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainRWD, drivetrainAWD, fuelPumpHP, injectorsDiesel, turbo, intercooler } from './builders'

const P = 'bmw-3-series'
const S = ['3 series', '3 серия', '3 серии', 'бмв 3']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === E46 engines ===
  // M54B22 — only 3-series (MPI atmo)
  engine(P, S, '2.2-170', 'M54B22', 170, ['M54B22']),
  starter(P, S, '2.2-170'),
  alternator(P, S, '2.2-170'),
  // M54B25 — shared with 5-series
  engine(P, S, '2.5-192', 'M54B25', 192, ['M54B25']),
  starter(P, S, '2.5-192'),
  alternator(P, S, '2.5-192'),
  // M54B30 — shared with 5-series
  engine(P, S, '3.0-231', 'M54B30', 231, ['M54B30']),
  starter(P, S, '3.0-231'),
  alternator(P, S, '3.0-231'),

  // === E90 engines ===
  // N46B20 — only 3-series (MPI atmo)
  engine(P, S, '2.0-156', 'N46B20', 156, ['N46B20']),
  starter(P, S, '2.0-156'),
  alternator(P, S, '2.0-156'),
  // N52B25 — shared with 5-series
  engine(P, S, '2.5-218', 'N52B25', 218, ['N52B25']),
  starter(P, S, '2.5-218'),
  alternator(P, S, '2.5-218'),
  // N52B30 — shared with 5-series
  engine(P, S, '3.0-258', 'N52B30', 258, ['N52B30']),
  starter(P, S, '3.0-258'),
  alternator(P, S, '3.0-258'),
  // N54B30 — shared with 5-series (GDI twin-turbo, ТНВД)
  engine(P, S, '3.0t-306', 'N54B30', 306, ['N54B30']),
  starter(P, S, '3.0t-306'),
  alternator(P, S, '3.0t-306'),
  fuelPumpHP(P, S, '3.0t-306'),
  turbo(P, S, '3.0t-306', 'N54B30', undefined, 'left'),
  turbo(P, S, '3.0t-306', 'N54B30', undefined, 'right'),
  intercooler(P, S, '3.0t-306'),
  // N47D20 — only 3-series (diesel, ТНВД)
  engine(P, S, '2.0d-177', 'N47D20', 177, ['N47D20']),
  starter(P, S, '2.0d-177'),
  alternator(P, S, '2.0d-177'),
  fuelPumpHP(P, S, '2.0d-177'),
  injectorsDiesel(P, S, '2.0d-177'),
  turbo(P, S, '2.0d-177', 'N47D20'),
  intercooler(P, S, '2.0d-177'),

  // === F30 engines (pre-LCI + LCI) ===
  // N20B20 184 — shared with 5-series (GDI turbo, ТНВД)
  engine(P, S, '2.0t-184', 'N20B20', 184, ['N20B20']),
  starter(P, S, '2.0t-184'),
  alternator(P, S, '2.0t-184'),
  fuelPumpHP(P, S, '2.0t-184'),
  turbo(P, S, '2.0t-184', 'N20B20'),
  intercooler(P, S, '2.0t-184'),
  // N20B20 245 — shared with 5-series
  engine(P, S, '2.0t-245', 'N20B20', 245, ['N20B20']),
  starter(P, S, '2.0t-245'),
  alternator(P, S, '2.0t-245'),
  fuelPumpHP(P, S, '2.0t-245'),
  turbo(P, S, '2.0t-245', 'N20B20'),
  intercooler(P, S, '2.0t-245'),
  // B48B20 184 — LCI, only 3-series (GDI turbo, ТНВД)
  engine(P, S, '2.0t-184b48', 'B48B20', 184, ['B48B20']),
  starter(P, S, '2.0t-184b48'),
  alternator(P, S, '2.0t-184b48'),
  fuelPumpHP(P, S, '2.0t-184b48'),
  turbo(P, S, '2.0t-184b48', 'B48B20'),
  intercooler(P, S, '2.0t-184b48'),
  // B48B20 258 — LCI 330i, only 3-series
  engine(P, S, '2.0t-258b48', 'B48B20', 258, ['B48B20']),
  starter(P, S, '2.0t-258b48'),
  alternator(P, S, '2.0t-258b48'),
  fuelPumpHP(P, S, '2.0t-258b48'),
  turbo(P, S, '2.0t-258b48', 'B48B20'),
  intercooler(P, S, '2.0t-258b48'),
  // N55B30 — shared with 5-series (GDI turbo, ТНВД) — суффикс n55 чтобы не конфликтовать с N54B30 3.0t-306 в E90
  engine(P, S, '3.0t-306n55', 'N55B30', 306, ['N55B30']),
  starter(P, S, '3.0t-306n55'),
  alternator(P, S, '3.0t-306n55'),
  fuelPumpHP(P, S, '3.0t-306n55'),
  turbo(P, S, '3.0t-306n55', 'N55B30'),
  intercooler(P, S, '3.0t-306n55'),
  // B47D20 — only 3-series (diesel, ТНВД)
  engine(P, S, '2.0d-190', 'B47D20', 190, ['B47D20']),
  starter(P, S, '2.0d-190'),
  alternator(P, S, '2.0d-190'),
  fuelPumpHP(P, S, '2.0d-190'),
  injectorsDiesel(P, S, '2.0d-190'),
  turbo(P, S, '2.0d-190', 'B47D20'),
  intercooler(P, S, '2.0d-190'),

  // === G20 engines ===
  // B48B20 184 — shared with F30 LCI (GDI turbo, ТНВД)
  engine(P, S, '2.0t-184b48', 'B48B20', 184, ['B48B20']),
  starter(P, S, '2.0t-184b48'),
  alternator(P, S, '2.0t-184b48'),
  fuelPumpHP(P, S, '2.0t-184b48'),
  turbo(P, S, '2.0t-184b48', 'B48B20'),
  intercooler(P, S, '2.0t-184b48'),
  // B48B20 258 — shared with F30 LCI
  engine(P, S, '2.0t-258b48', 'B48B20', 258, ['B48B20']),
  starter(P, S, '2.0t-258b48'),
  alternator(P, S, '2.0t-258b48'),
  fuelPumpHP(P, S, '2.0t-258b48'),
  turbo(P, S, '2.0t-258b48', 'B48B20'),
  intercooler(P, S, '2.0t-258b48'),
  // B58B30 374 — M340i, only G20 (GDI turbo, ТНВД)
  engine(P, S, '3.0t-374', 'B58B30', 374, ['B58B30']),
  starter(P, S, '3.0t-374'),
  alternator(P, S, '3.0t-374'),
  fuelPumpHP(P, S, '3.0t-374'),
  turbo(P, S, '3.0t-374', 'B58B30'),
  intercooler(P, S, '3.0t-374'),
  // B47D20 — shared with F30 (diesel, ТНВД)
  engine(P, S, '2.0d-190', 'B47D20', 190, ['B47D20']),
  starter(P, S, '2.0d-190'),
  alternator(P, S, '2.0d-190'),
  fuelPumpHP(P, S, '2.0d-190'),
  injectorsDiesel(P, S, '2.0d-190'),
  turbo(P, S, '2.0d-190', 'B47D20'),
  intercooler(P, S, '2.0d-190'),

  // === Transmissions ===
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'at5', 'АКПП 5-ступ ZF 5HP19', ['5HP19']),
  ecuTransmission(P, S, 'at5'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at6', 'АКПП 6-ступ ZF 6HP21', ['6HP21']),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'at8', 'АКПП 8-ступ ZF 8HP45', ['8HP45']),
  ecuTransmission(P, S, 'at8'),

  // === Drivetrain ===
  ...drivetrainRWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'VII (G20) (2018-2024)',
    slug: 'g20',
    yearStart: 2018,
    yearEnd: 2024,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0t-184b48',
      'engine:2.0t-258b48',
      'engine:3.0t-374',
      'engine:2.0d-190',
      'transmission:at8',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'VI (F30) (2011-2019)',
    slug: 'f30',
    yearStart: 2011,
    yearEnd: 2019,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0t-184',
      'engine:2.0t-245',
      'engine:2.0t-184b48',
      'engine:2.0t-258b48',
      'engine:3.0t-306n55',
      'engine:2.0d-190',
      'transmission:mt6',
      'transmission:at8',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'V (E90) (2004-2013)',
    slug: 'e90',
    yearStart: 2004,
    yearEnd: 2013,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-156',
      'engine:2.5-218',
      'engine:3.0-258',
      'engine:3.0t-306',
      'engine:2.0d-177',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'IV (E46) (1998-2006)',
    slug: 'e46',
    yearStart: 1998,
    yearEnd: 2006,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.2-170',
      'engine:2.5-192',
      'engine:3.0-231',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:rwd',
    ],
  },
]

export const bmw3SeriesSeed = {
  brand: {
    name: 'BMW',
    slug: 'bmw',
    logo: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 .78C18.196.78 23.219 5.803 23.219 12c0 6.196-5.022 11.219-11.219 11.219C5.803 23.219.781 18.196.781 12S5.804.78 12 .78zm-.678.63c-.33.014-.66.042-.992.078l-.107 2.944a9.95 9.95 0 0 1 .71-.094l.07-1.988-.013-.137.043.13.664 1.489h.606l.664-1.488.04-.131-.01.137.07 1.988c.232.022.473.054.71.094l-.109-2.944a14.746 14.746 0 0 0-.992-.078l-.653 1.625-.023.12-.023-.12-.655-1.625zm6.696 1.824l-1.543 2.428c.195.15.452.371.617.522l1.453-.754.092-.069-.069.094-.752 1.453c.163.175.398.458.53.63l2.43-1.544a16.135 16.135 0 0 0-.46-.568L18.777 6.44l-.105.092.078-.115.68-1.356-.48-.48-1.356.68-.115.078.091-.106 1.018-1.539c-.18-.152-.351-.291-.57-.46zM5.5 3.785c-.36.037-.638.283-1.393 1.125a18.97 18.97 0 0 0-.757.914l2.074 1.967c.687-.76.966-1.042 1.508-1.613.383-.405.6-.87.216-1.317-.208-.242-.558-.295-.85-.175l-.028.01.01-.026a.7.7 0 0 0-.243-.734.724.724 0 0 0-.537-.15zm.006.615c.136-.037.277.06.308.2.032.14-.056.272-.154.382-.22.25-1.031 1.098-1.031 1.098l-.402-.383c.417-.51.861-.974 1.062-1.158a.55.55 0 0 1 .217-.139zM12 4.883a7.114 7.114 0 0 0-7.08 6.388v.002a7.122 7.122 0 0 0 8.516 7.697 7.112 7.112 0 0 0 5.68-6.97A7.122 7.122 0 0 0 12 4.885v-.002zm-5.537.242c.047 0 .096.013.14.043.088.059.128.16.106.26-.026.119-.125.231-.205.318l-1.045 1.12-.42-.4s.787-.832 1.045-1.099c.102-.106.168-.17.238-.205a.331.331 0 0 1 .14-.037zM12 5.818A6.175 6.175 0 0 1 18.182 12H12v6.182A6.175 6.175 0 0 1 5.818 12H12V5.818Z',
    sortOrder: 4,
  },

  model: {
    name: '3 Series',
    slug: '3-series',
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
