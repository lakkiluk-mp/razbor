import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, fuelPumpHP, injectorsDiesel, turbo, intercooler, drivetrainFWD, drivetrainAWD } from './builders'

const P = 'hyundai-tucson'
const S = ['hyundai tucson', 'хёндай туссон', 'хендай туссон', 'туссон', 'хёндай тусон', 'хендай тусон', 'тусон', 'hyundai ix35', 'хёндай ix35', 'хендай ix35', 'ix35']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // JM — G4GC 2.0 MPI (shared)
  engine(P, S, '2.0-142', 'G4GC', 142, ['G4GC']),
  starter(P, S, '2.0-142', 'G4GC'),
  alternator(P, S, '2.0-142', 'G4GC'),

  // JM — G6BA 2.7 V6 MPI
  engine(P, S, '2.7-175', 'G6BA', 175),
  starter(P, S, '2.7-175', 'G6BA'),
  alternator(P, S, '2.7-175', 'G6BA'),

  // JM — D4EA 2.0 CRDi дизель
  engine(P, S, '2.0d-112', 'D4EA', 112),
  starter(P, S, '2.0d-112', 'D4EA'),
  alternator(P, S, '2.0d-112', 'D4EA'),
  fuelPumpHP(P, S, '2.0d-112'),
  injectorsDiesel(P, S, '2.0d-112'),
  turbo(P, S, '2.0d-112', 'D4EA'),
  intercooler(P, S, '2.0d-112'),

  // LM/ix35 — G4KD 2.0 MPI (shared)
  engine(P, S, '2.0-150', 'G4KD', 150, ['G4KD']),
  starter(P, S, '2.0-150', 'G4KD'),
  alternator(P, S, '2.0-150', 'G4KD'),

  // LM/ix35 — G4NA 2.0 MPI (shared)
  engine(P, S, '2.0-150n', 'G4NA', 150, ['G4NA']),
  starter(P, S, '2.0-150n', 'G4NA'),
  alternator(P, S, '2.0-150n', 'G4NA'),

  // LM/ix35 + TL — D4HA 2.0 CRDi дизель
  engine(P, S, '2.0d-185', 'D4HA', 185),
  starter(P, S, '2.0d-185', 'D4HA'),
  alternator(P, S, '2.0d-185', 'D4HA'),
  fuelPumpHP(P, S, '2.0d-185'),
  injectorsDiesel(P, S, '2.0d-185'),
  turbo(P, S, '2.0d-185', 'D4HA'),
  intercooler(P, S, '2.0d-185'),

  // TL — G4FD 1.6 GDI (shared)
  engine(P, S, '1.6-132', 'G4FD', 132, ['G4FD']),
  starter(P, S, '1.6-132', 'G4FD'),
  alternator(P, S, '1.6-132', 'G4FD'),
  fuelPumpHP(P, S, '1.6-132'),

  // TL — G4FJ 1.6T T-GDI (shared)
  engine(P, S, '1.6t-177', 'G4FJ', 177, ['G4FJ']),
  starter(P, S, '1.6t-177', 'G4FJ'),
  alternator(P, S, '1.6t-177', 'G4FJ'),
  fuelPumpHP(P, S, '1.6t-177'),
  turbo(P, S, '1.6t-177', 'G4FJ'),
  intercooler(P, S, '1.6t-177'),

  // TL — G4KJ 2.4 GDI (shared)
  engine(P, S, '2.4-184', 'G4KJ', 184, ['G4KJ']),
  starter(P, S, '2.4-184', 'G4KJ'),
  alternator(P, S, '2.4-184', 'G4KJ'),
  fuelPumpHP(P, S, '2.4-184'),

  // NX4 — G4NL 2.0 GDI (shared)
  engine(P, S, '2.0-150l', 'G4NL', 150, ['G4NL']),
  starter(P, S, '2.0-150l', 'G4NL'),
  alternator(P, S, '2.0-150l', 'G4NL'),
  fuelPumpHP(P, S, '2.0-150l'),

  // NX4 — G4KN 2.5 GDI (shared)
  engine(P, S, '2.5-190', 'G4KN', 190, ['G4KN']),
  starter(P, S, '2.5-190', 'G4KN'),
  alternator(P, S, '2.5-190', 'G4KN'),
  fuelPumpHP(P, S, '2.5-190'),

  // NX4 — D4HD 2.0 CRDi дизель
  engine(P, S, '2.0d-186', 'D4HD', 186),
  starter(P, S, '2.0d-186', 'D4HD'),
  alternator(P, S, '2.0d-186', 'D4HD'),
  fuelPumpHP(P, S, '2.0d-186'),
  injectorsDiesel(P, S, '2.0d-186'),
  turbo(P, S, '2.0d-186', 'D4HD'),
  intercooler(P, S, '2.0d-186'),

  // КПП
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at4', 'АКПП 4-ступ'),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'at6', 'АКПП 6-ступ'),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'at8', 'АКПП 8-ступ'),
  ecuTransmission(P, S, 'at8'),
  transmission(P, S, 'robot', 'Робот DCT 7-ступ'),
  ecuTransmission(P, S, 'robot'),

  // Привод
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'IV (NX4) (2020-2024)',
    slug: 'nx4',
    yearStart: 2020,
    yearEnd: 2024,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150l',
      'engine:2.5-190',
      'engine:2.0d-186',
      'transmission:mt6',
      'transmission:at6',
      'transmission:at8',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'III (TL) (2015-2021)',
    slug: 'tl',
    yearStart: 2015,
    yearEnd: 2021,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-132',
      'engine:1.6t-177',
      'engine:2.0-150n',
      'engine:2.4-184',
      'engine:2.0d-185',
      'transmission:mt5',
      'transmission:mt6',
      'transmission:at6',
      'transmission:at8',
      'transmission:robot',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (LM/ix35) (2009-2015)',
    slug: 'lm',
    yearStart: 2009,
    yearEnd: 2015,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150',
      'engine:2.0-150n',
      'engine:2.0d-185',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'I (JM) (2004-2009)',
    slug: 'jm',
    yearStart: 2004,
    yearEnd: 2009,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-142',
      'engine:2.7-175',
      'engine:2.0d-112',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
]

export const hyundaiTucsonSeed = {
  brand: {
    name: 'Hyundai',
    slug: 'hyundai',
    logo: 'M12 18.1622c-6.6275 0-12-2.7586-12-6.163 0-3.4028 5.3725-6.1614 12-6.1614 6.6278 0 12 2.7586 12 6.1614 0 3.4044-5.3722 6.163-12 6.163zM7.6023 7.17C3.701 7.9784.973 9.8302.973 11.9844c0 1.1929.8382 2.2932 2.248 3.1757.1174.0724.1941.0862.251.0826.1019-.006.1593-.0698.201-.146.028-.0485.0631-.1225.0972-.1968.4601-1.0834 2.0776-4.8333 4.2023-7.3758a1.1775 1.1775 0 0 0 .1048-.1461c.046-.084.0356-.1513.0006-.192-.0593-.0647-.2247-.065-.4756-.016zM9.742 8.8995c-1.1728 2.8492 1.0473 2.4961 1.6478 2.3637 1.0203-.2258 1.9944-.6128 2.7746-.925 2.2216-.8887 3.4012-1.7804 3.7925-2.123a1.9839 1.9839 0 0 0 .1076-.0988c.0557-.058.0976-.1192.0976-.2002 0-.0936-.081-.1687-.2374-.2231-.012-.0049-.0517-.021-.0641-.025-1.698-.5415-3.724-.8563-5.9016-.8563-.0168 0-.0586-.0022-.1169 0-.2608.0078-.5509.0664-.787.1888-.7777.4049-1.1163 1.4235-1.313 1.899zm10.5851.0037c-.0268.0487-.0612.1224-.0962.1974-.4599 1.0826-2.0774 4.831-4.2018 7.3733-.0515.063-.0796.1031-.1042.1467-.0492.0846-.0388.1535 0 .1935.0572.0641.2235.0654.474.0157 3.8998-.81 6.628-2.6606 6.628-4.8149 0-1.1925-.836-2.2928-2.2472-3.1745-.1161-.073-.1934-.0871-.25-.083-.1028.0067-.16.0699-.2026.1458zM14.258 15.099c1.173-2.849-1.0483-2.494-1.6467-2.3622-1.0218.225-1.996.613-2.7757.924-2.2226.8883-3.4017 1.782-3.7944 2.1234-.0468.0428-.0833.0742-.1066.0995-.0564.0573-.0967.1178-.0967.2007 0 .0923.08.1688.2362.2229.012.0048.0511.0213.0657.0255 1.696.54 3.722.8557 5.9.8557.0177 0 .0592.0016.1178 0 .2609-.0081.5522-.0677.7871-.1888.7781-.4052 1.1169-1.4234 1.3133-1.9007z',
    sortOrder: 8,
  },

  model: {
    name: 'Tucson',
    slug: 'tucson',
    isPopular: true,
    sortOrder: 4,
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
