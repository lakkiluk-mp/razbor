import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainAWD, fuelPumpHP, injectorsDiesel, turbo, intercooler } from './builders'

const P = 'bmw-x5'
const S = ['x5', 'х5', 'бмв x5']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === E53 engines ===
  // M54B30 — shared (atmo MPI, без ТНВД)
  engine(P, S, '3.0-231', 'M54B30', 231, ['M54B30']),
  starter(P, S, '3.0-231'),
  alternator(P, S, '3.0-231'),

  // M62TUB44 — atmo MPI
  engine(P, S, '4.4-286', 'M62TUB44', 286, ['M62TUB44']),
  starter(P, S, '4.4-286'),
  alternator(P, S, '4.4-286'),

  // M57D30TU — diesel turbo
  engine(P, S, '3.0d-218', 'M57D30TU', 218, ['M57D30TU']),
  starter(P, S, '3.0d-218'),
  alternator(P, S, '3.0d-218'),
  fuelPumpHP(P, S, '3.0d-218'),
  injectorsDiesel(P, S, '3.0d-218'),
  turbo(P, S, '3.0d-218', 'M57D30TU'),
  intercooler(P, S, '3.0d-218'),

  // N62B44 — atmo MPI
  engine(P, S, '4.4-320', 'N62B44', 320, ['N62B44']),
  starter(P, S, '4.4-320'),
  alternator(P, S, '4.4-320'),

  // N62B48 — atmo MPI (E53 + E70)
  engine(P, S, '4.8-360', 'N62B48', 360, ['N62B48']),
  starter(P, S, '4.8-360'),
  alternator(P, S, '4.8-360'),

  // === E70 engines ===
  // N52B30 — shared (atmo MPI, без ТНВД)
  engine(P, S, '3.0-272', 'N52B30', 272, ['N52B30']),
  starter(P, S, '3.0-272'),
  alternator(P, S, '3.0-272'),

  // M57D30TU2 — diesel turbo
  engine(P, S, '3.0d-231', 'M57D30TU2', 231, ['M57D30TU2']),
  starter(P, S, '3.0d-231'),
  alternator(P, S, '3.0d-231'),
  fuelPumpHP(P, S, '3.0d-231'),
  injectorsDiesel(P, S, '3.0d-231'),
  turbo(P, S, '3.0d-231', 'M57D30TU2'),
  intercooler(P, S, '3.0d-231'),

  // N62B48 — atmo MPI (E70, 355 л.с.) — используем тот же config что и E53
  // Уже создан выше как 4.8-360, для E70 будет та же запчасть

  // N57D30 — shared diesel turbo
  engine(P, S, '3.0d-245', 'N57D30', 245, ['N57D30']),
  starter(P, S, '3.0d-245'),
  alternator(P, S, '3.0d-245'),
  fuelPumpHP(P, S, '3.0d-245'),
  injectorsDiesel(P, S, '3.0d-245'),
  turbo(P, S, '3.0d-245', 'N57D30'),
  intercooler(P, S, '3.0d-245'),

  // N55B30 — shared turbo GDI
  engine(P, S, '3.0t-306', 'N55B30', 306, ['N55B30']),
  starter(P, S, '3.0t-306'),
  alternator(P, S, '3.0t-306'),
  fuelPumpHP(P, S, '3.0t-306'),
  turbo(P, S, '3.0t-306', 'N55B30'),
  intercooler(P, S, '3.0t-306'),

  // N63B44 — shared biturbo V8 GDI
  engine(P, S, '4.4t-407', 'N63B44', 407, ['N63B44']),
  starter(P, S, '4.4t-407'),
  alternator(P, S, '4.4t-407'),
  fuelPumpHP(P, S, '4.4t-407'),
  turbo(P, S, '4.4t-407', 'N63B44', undefined, 'left'),
  turbo(P, S, '4.4t-407', 'N63B44', undefined, 'right'),
  intercooler(P, S, '4.4t-407'),

  // === F15 engines ===
  // N20B20 — shared turbo GDI
  engine(P, S, '2.0t-245', 'N20B20', 245, ['N20B20']),
  starter(P, S, '2.0t-245'),
  alternator(P, S, '2.0t-245'),
  fuelPumpHP(P, S, '2.0t-245'),
  turbo(P, S, '2.0t-245', 'N20B20'),
  intercooler(P, S, '2.0t-245'),

  // N57D30 — shared diesel (F15, 249 л.с.) — используем тот же config 3.0d-245

  // N55B30 — shared turbo GDI (F15) — уже создан выше

  // N63B44 — shared biturbo (F15, 450 л.с.) — используем тот же config 4.4t-407

  // === G05 engines ===
  // B47D20 — diesel turbo (не shared)
  engine(P, S, '2.0d-231', 'B47D20', 231, ['B47D20']),
  starter(P, S, '2.0d-231'),
  alternator(P, S, '2.0d-231'),
  fuelPumpHP(P, S, '2.0d-231'),
  injectorsDiesel(P, S, '2.0d-231'),
  turbo(P, S, '2.0d-231', 'B47D20'),
  intercooler(P, S, '2.0d-231'),

  // B57D30 — diesel turbo (не shared)
  engine(P, S, '3.0d-249', 'B57D30', 249, ['B57D30']),
  starter(P, S, '3.0d-249'),
  alternator(P, S, '3.0d-249'),
  fuelPumpHP(P, S, '3.0d-249'),
  injectorsDiesel(P, S, '3.0d-249'),
  turbo(P, S, '3.0d-249', 'B57D30'),
  intercooler(P, S, '3.0d-249'),

  // B58B30M0 — turbo GDI (не shared, специфичная модификация для X5)
  engine(P, S, '3.0t-340', 'B58B30M0', 340, ['B58B30M0']),
  starter(P, S, '3.0t-340'),
  alternator(P, S, '3.0t-340'),
  fuelPumpHP(P, S, '3.0t-340'),
  turbo(P, S, '3.0t-340', 'B58B30M0'),
  intercooler(P, S, '3.0t-340'),

  // N63B44 — shared biturbo V8 GDI (G05, 462 л.с.) — используем тот же config 4.4t-407

  // === Transmissions ===
  transmission(P, S, 'at5x', 'АКПП 5-ступ ZF 5HP24', ['5HP24']),
  ecuTransmission(P, S, 'at5x'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at6x', 'АКПП 6-ступ ZF 6HP28', ['6HP28']),
  ecuTransmission(P, S, 'at6x'),
  transmission(P, S, 'at8', 'АКПП 8-ступ ZF 8HP45', ['8HP45']),
  ecuTransmission(P, S, 'at8'),
  transmission(P, S, 'at8x76', 'АКПП 8-ступ ZF 8HP76X', ['8HP76X']),
  ecuTransmission(P, S, 'at8x76'),

  // === Drivetrain (только AWD для X5) ===
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'IV (G05) (2018-2022)',
    slug: 'g05',
    yearStart: 2018,
    yearEnd: 2022,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0d-231',
      'engine:3.0d-249',
      'engine:3.0t-340',
      'engine:4.4t-407',
      'transmission:at8x76',
      'drivetrain:awd',
    ],
  },
  {
    name: 'III (F15) (2013-2018)',
    slug: 'f15',
    yearStart: 2013,
    yearEnd: 2018,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0t-245',
      'engine:3.0d-245',
      'engine:3.0t-306',
      'engine:4.4t-407',
      'transmission:at8',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (E70) (2006-2013)',
    slug: 'e70',
    yearStart: 2006,
    yearEnd: 2013,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.0-272',
      'engine:3.0d-231',
      'engine:4.8-360',
      'engine:3.0d-245',
      'engine:3.0t-306',
      'engine:4.4t-407',
      'transmission:at6x',
      'transmission:at8',
      'drivetrain:awd',
    ],
  },
  {
    name: 'I (E53) (1999-2006)',
    slug: 'e53',
    yearStart: 1999,
    yearEnd: 2006,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.0-231',
      'engine:4.4-286',
      'engine:3.0d-218',
      'engine:4.4-320',
      'engine:4.8-360',
      'transmission:at5x',
      'transmission:mt6',
      'drivetrain:awd',
    ],
  },
]

export const bmwX5Seed = {
  brand: {
    name: 'BMW',
    slug: 'bmw',
    logo: 'M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 .78C18.196.78 23.219 5.803 23.219 12c0 6.196-5.022 11.219-11.219 11.219C5.803 23.219.781 18.196.781 12S5.804.78 12 .78zm-.678.63c-.33.014-.66.042-.992.078l-.107 2.944a9.95 9.95 0 0 1 .71-.094l.07-1.988-.013-.137.043.13.664 1.489h.606l.664-1.488.04-.131-.01.137.07 1.988c.232.022.473.054.71.094l-.109-2.944a14.746 14.746 0 0 0-.992-.078l-.653 1.625-.023.12-.023-.12-.655-1.625zm6.696 1.824l-1.543 2.428c.195.15.452.371.617.522l1.453-.754.092-.069-.069.094-.752 1.453c.163.175.398.458.53.63l2.43-1.544a16.135 16.135 0 0 0-.46-.568L18.777 6.44l-.105.092.078-.115.68-1.356-.48-.48-1.356.68-.115.078.091-.106 1.018-1.539c-.18-.152-.351-.291-.57-.46zM5.5 3.785c-.36.037-.638.283-1.393 1.125a18.97 18.97 0 0 0-.757.914l2.074 1.967c.687-.76.966-1.042 1.508-1.613.383-.405.6-.87.216-1.317-.208-.242-.558-.295-.85-.175l-.028.01.01-.026a.7.7 0 0 0-.243-.734.724.724 0 0 0-.537-.15zm.006.615c.136-.037.277.06.308.2.032.14-.056.272-.154.382-.22.25-1.031 1.098-1.031 1.098l-.402-.383c.417-.51.861-.974 1.062-1.158a.55.55 0 0 1 .217-.139zM12 4.883a7.114 7.114 0 0 0-7.08 6.388v.002a7.122 7.122 0 0 0 8.516 7.697 7.112 7.112 0 0 0 5.68-6.97A7.122 7.122 0 0 0 12 4.885v-.002zm-5.537.242c.047 0 .096.013.14.043.088.059.128.16.106.26-.026.119-.125.231-.205.318l-1.045 1.12-.42-.4s.787-.832 1.045-1.099c.102-.106.168-.17.238-.205a.331.331 0 0 1 .14-.037zM12 5.818A6.175 6.175 0 0 1 18.182 12H12v6.182A6.175 6.175 0 0 1 5.818 12H12V5.818Z',
    sortOrder: 4,
  },

  model: {
    name: 'X5',
    slug: 'x5',
    isPopular: true,
    sortOrder: 3,
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
