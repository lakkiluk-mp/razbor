import { BodyType } from '@prisma/client'
import type { PartData, GenerationData } from './types'
import { getBaseParts } from './base-parts'
import {
  engine,
  starter,
  alternator,
  fuelPumpHP,
  turbo,
  intercooler,
  transmission,
  ecuTransmission,
  drivetrainAWD,
} from './builders'

const P = 'subaru-forester'
const S = ['forester', 'форестер']

const modelSpecificParts: PartData[] = [
  // ========================================
  // EJ20 — 2.0 атмо SOHC (122-137 л.с.) — SF, SG
  // MPI, без ТНВД, без турбо
  // ========================================
  engine(P, S, '2.0-125', 'EJ20', 125, ['10103AB190']),
  starter(P, S, '2.0-125', 'EJ20'),
  alternator(P, S, '2.0-125', 'EJ20'),

  // ========================================
  // EJ204 — 2.0 атмо DOHC (148-158 л.с.) — SG, SH
  // MPI, без ТНВД, без турбо
  // ========================================
  engine(P, S, '2.0-158', 'EJ204', 158),
  starter(P, S, '2.0-158', 'EJ204'),
  alternator(P, S, '2.0-158', 'EJ204'),

  // ========================================
  // EJ205 — 2.0 турбо (170-177 л.с.) — SF, SG
  // MPI+Turbo, без ТНВД, с турбиной + интеркулер
  // ========================================
  engine(P, S, '2.0t-177', 'EJ205', 177, ['10103AB640']),
  starter(P, S, '2.0t-177', 'EJ205'),
  alternator(P, S, '2.0t-177', 'EJ205'),
  turbo(P, S, '2.0t-177', 'EJ205'),
  intercooler(P, S, '2.0t-177'),

  // ========================================
  // EJ253 — 2.5 атмо SOHC (170-175 л.с.) — SH
  // MPI, без ТНВД, без турбо
  // ========================================
  engine(P, S, '2.5-172', 'EJ253', 172, ['11008AA470']),
  starter(P, S, '2.5-172', 'EJ253'),
  alternator(P, S, '2.5-172', 'EJ253'),

  // ========================================
  // EJ255 — 2.5 турбо (210-263 л.с.) — SG, SH
  // MPI+Turbo, без ТНВД, с турбиной + интеркулер
  // ========================================
  engine(P, S, '2.5t-230', 'EJ255', 230, ['11010AB220']),
  starter(P, S, '2.5t-230', 'EJ255'),
  alternator(P, S, '2.5t-230', 'EJ255'),
  turbo(P, S, '2.5t-230', 'EJ255'),
  intercooler(P, S, '2.5t-230'),

  // ========================================
  // FB20 — 2.0 атмо (150 л.с.) — SH рест., SJ, SK
  // MPI (цепной привод ГРМ), без ТНВД, без турбо
  // ========================================
  engine(P, S, '2.0-150', 'FB20', 150),
  starter(P, S, '2.0-150', 'FB20'),
  alternator(P, S, '2.0-150', 'FB20'),

  // ========================================
  // FB25 — 2.5 атмо (171-185 л.с.) — SH рест., SJ, SK
  // MPI, без ТНВД, без турбо
  // ========================================
  engine(P, S, '2.5-171', 'FB25', 171, ['10103AC650']),
  starter(P, S, '2.5-171', 'FB25'),
  alternator(P, S, '2.5-171', 'FB25'),

  // ========================================
  // FA20 DIT — 2.0 турбо GDI (241 л.с.) — SJ
  // Direct Injection Turbo — с ТНВД, турбиной, интеркулером
  // ========================================
  engine(P, S, '2.0t-241', 'FA20', 241),
  starter(P, S, '2.0t-241', 'FA20'),
  alternator(P, S, '2.0t-241', 'FA20'),
  fuelPumpHP(P, S, '2.0t-241'),
  turbo(P, S, '2.0t-241', 'FA20'),
  intercooler(P, S, '2.0t-241'),

  // ========================================
  // КПП
  // ========================================
  transmission(P, S, 'mt', 'МКПП 5-ступ (TY755)', ['TY755']),
  transmission(P, S, 'at4', 'АКПП 4-ступ (4EAT)', ['4EAT']),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'at5', 'АКПП 5-ступ (5EAT)', ['5EAT']),
  ecuTransmission(P, S, 'at5'),
  transmission(P, S, 'cvt', 'Вариатор Lineartronic (TR580)', ['TR580']),
  ecuTransmission(P, S, 'cvt'),
  transmission(P, S, 'cvt-t', 'Вариатор Lineartronic (TR690)', ['TR690']),
  ecuTransmission(P, S, 'cvt-t'),

  // ========================================
  // Привод — все Forester AWD
  // ========================================
  ...drivetrainAWD(P, S),
] as PartData[]

const generations: GenerationData[] = [
  {
    name: 'V (SK) (2018-2022)',
    slug: 'sk',
    yearStart: 2018,
    yearEnd: 2022,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150', 'engine:2.5-171',
      'transmission:cvt',
      'drivetrain:awd',
    ],
  },
  {
    name: 'IV (SJ) (2012-2019)',
    slug: 'sj',
    yearStart: 2012,
    yearEnd: 2019,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150', 'engine:2.5-171', 'engine:2.0t-241',
      'transmission:mt', 'transmission:cvt', 'transmission:cvt-t',
      'drivetrain:awd',
    ],
  },
  {
    name: 'III (SH) (2007-2013)',
    slug: 'sh',
    yearStart: 2007,
    yearEnd: 2013,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-158', 'engine:2.5-172', 'engine:2.5t-230',
      'engine:2.0-150', 'engine:2.5-171',
      'transmission:mt', 'transmission:at4', 'transmission:at5',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (SG) (2002-2008)',
    slug: 'sg',
    yearStart: 2002,
    yearEnd: 2008,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-125', 'engine:2.0-158', 'engine:2.0t-177', 'engine:2.5t-230',
      'transmission:mt', 'transmission:at4',
      'drivetrain:awd',
    ],
  },
  {
    name: 'I (SF) (1997-2002)',
    slug: 'sf',
    yearStart: 1997,
    yearEnd: 2002,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-125', 'engine:2.0t-177',
      'transmission:mt', 'transmission:at4',
      'drivetrain:awd',
    ],
  },
]

export const subaruForesterSeed = {
  brand: {
    name: 'Subaru',
    slug: 'subaru',
    logo: 'M12 4.983c3.004 0 6.224.612 8.786 2.239C22.451 8.286 24 9.9 24 12.002c0 2.456-2.097 4.242-4.106 5.287-2.391 1.238-5.216 1.728-7.894 1.728-3.003 0-6.217-.605-8.78-2.238C1.556 15.714 0 14.101 0 12.003 0 9.536 2.092 7.757 4.106 6.71 6.504 5.474 9.323 4.983 12 4.983zm-.025.746c-2.793 0-5.802.523-8.225 1.983-1.524.912-3.03 2.347-3.03 4.253 0 2.239 2.04 3.806 3.864 4.706 2.258 1.102 4.897 1.53 7.391 1.53 2.798 0 5.809-.523 8.232-1.983 1.517-.918 3.029-2.346 3.029-4.253 0-2.243-2.035-3.813-3.864-4.705-2.258-1.104-4.898-1.53-7.397-1.53zm-10.54 4.686l4.597-.784 1.384-3.003L8.794 9.63l4.596.784-4.596.792-1.378 3.01-1.384-3.01zm10.106 2.289l2.028-.356.605-1.359.606 1.359 2.028.356-2.028.35-.606 1.36-.605-1.36zm4.196-3.621l2.028-.35.605-1.365.606 1.364 2.028.35-2.028.357-.606 1.36-.606-1.36zM13.57 15.51l2.02-.35.607-1.365.612 1.365 2.027.35-2.027.357-.612 1.36-.606-1.36zm-6.23.491l2.028-.35.612-1.366.605 1.366 2.028.35-2.028.357-.605 1.359-.612-1.359zm10.196-3.353l2.022-.357.605-1.359.612 1.359 2.028.357-2.028.35-.612 1.357-.606-1.357Z',
    sortOrder: 15,
  },
  model: { name: 'Forester', slug: 'forester', isPopular: true, sortOrder: 1 },
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
