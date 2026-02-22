import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainFWD, drivetrainAWD } from './builders'

const P = 'hyundai-creta'
const S = ['hyundai creta', 'хёндай крета', 'хендай крета', 'крета']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.6-123', 'G4FG', 123, ['G4FG']),
  starter(P, S, '1.6-123', 'G4FG'),
  alternator(P, S, '1.6-123', 'G4FG'),

  engine(P, S, '2.0-149', 'G4NA', 149, ['G4NA']),
  starter(P, S, '2.0-149', 'G4NA'),
  alternator(P, S, '2.0-149', 'G4NA'),

  engine(P, S, '1.5-115', 'G4FL', 115),
  starter(P, S, '1.5-115', 'G4FL'),
  alternator(P, S, '1.5-115', 'G4FL'),

  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at6', 'АКПП 6-ступ'),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'cvt', 'Вариатор IVT'),
  ecuTransmission(P, S, 'cvt'),

  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (GS) (2015-2021)',
    slug: 'gs',
    yearStart: 2015,
    yearEnd: 2021,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-123',
      'engine:2.0-149',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (SU2) (2020-2024)',
    slug: 'su2',
    yearStart: 2020,
    yearEnd: 2024,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-123',
      'engine:2.0-149',
      'engine:1.5-115',
      'transmission:mt6',
      'transmission:at6',
      'transmission:cvt',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
]

export const hyundaiCretaSeed = {
  brand: {
    name: 'Hyundai',
    slug: 'hyundai',
    logo: 'M12 18.1622c-6.6275 0-12-2.7586-12-6.163 0-3.4028 5.3725-6.1614 12-6.1614 6.6278 0 12 2.7586 12 6.1614 0 3.4044-5.3722 6.163-12 6.163zM7.6023 7.17C3.701 7.9784.973 9.8302.973 11.9844c0 1.1929.8382 2.2932 2.248 3.1757.1174.0724.1941.0862.251.0826.1019-.006.1593-.0698.201-.146.028-.0485.0631-.1225.0972-.1968.4601-1.0834 2.0776-4.8333 4.2023-7.3758a1.1775 1.1775 0 0 0 .1048-.1461c.046-.084.0356-.1513.0006-.192-.0593-.0647-.2247-.065-.4756-.016zM9.742 8.8995c-1.1728 2.8492 1.0473 2.4961 1.6478 2.3637 1.0203-.2258 1.9944-.6128 2.7746-.925 2.2216-.8887 3.4012-1.7804 3.7925-2.123a1.9839 1.9839 0 0 0 .1076-.0988c.0557-.058.0976-.1192.0976-.2002 0-.0936-.081-.1687-.2374-.2231-.012-.0049-.0517-.021-.0641-.025-1.698-.5415-3.724-.8563-5.9016-.8563-.0168 0-.0586-.0022-.1169 0-.2608.0078-.5509.0664-.787.1888-.7777.4049-1.1163 1.4235-1.313 1.899zm10.5851.0037c-.0268.0487-.0612.1224-.0962.1974-.4599 1.0826-2.0774 4.831-4.2018 7.3733-.0515.063-.0796.1031-.1042.1467-.0492.0846-.0388.1535 0 .1935.0572.0641.2235.0654.474.0157 3.8998-.81 6.628-2.6606 6.628-4.8149 0-1.1925-.836-2.2928-2.2472-3.1745-.1161-.073-.1934-.0871-.25-.083-.1028.0067-.16.0699-.2026.1458zM14.258 15.099c1.173-2.849-1.0483-2.494-1.6467-2.3622-1.0218.225-1.996.613-2.7757.924-2.2226.8883-3.4017 1.782-3.7944 2.1234-.0468.0428-.0833.0742-.1066.0995-.0564.0573-.0967.1178-.0967.2007 0 .0923.08.1688.2362.2229.012.0048.0511.0213.0657.0255 1.696.54 3.722.8557 5.9.8557.0177 0 .0592.0016.1178 0 .2609-.0081.5522-.0677.7871-.1888.7781-.4052 1.1169-1.4234 1.3133-1.9007z',
    sortOrder: 8,
  },

  model: {
    name: 'Creta',
    slug: 'creta',
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
