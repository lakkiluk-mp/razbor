import { BodyType } from '@prisma/client'
import type { PartData, SharedPartRef, GenerationData } from './types'
import { isSharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import {
  engine,
  starter,
  alternator,
  fuelPumpHP,
  transmission,
  ecuTransmission,
  drivetrainFWD,
  drivetrainAWD,
} from './builders'

const P = 'subaru-impreza'
const S = ['impreza', 'импреза']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // ========================================
  // EJ201 — 2.0 атмо SOHC (125 л.с.) — GD
  // MPI, без ТНВД, без турбо
  // ========================================
  engine(P, S, '2.0-125', 'EJ201', 125),
  starter(P, S, '2.0-125', 'EJ201'),
  alternator(P, S, '2.0-125', 'EJ201'),

  // ========================================
  // EL154 — 1.5 атмо (105 л.с.) — GD
  // MPI, без ТНВД, без турбо
  // ========================================
  engine(P, S, '1.5-105', 'EL154', 105),
  starter(P, S, '1.5-105', 'EL154'),
  alternator(P, S, '1.5-105', 'EL154'),

  // ========================================
  // EJ204 — 2.0 атмо DOHC (160 л.с.) — GD
  // MPI, без ТНВД, без турбо
  // ========================================
  engine(P, S, '2.0-160', 'EJ204', 160),
  starter(P, S, '2.0-160', 'EJ204'),
  alternator(P, S, '2.0-160', 'EJ204'),

  // ========================================
  // EL15 — 1.5 атмо (110 л.с.) — GE
  // MPI, без ТНВД, без турбо
  // ========================================
  engine(P, S, '1.5-110', 'EL15', 110),
  starter(P, S, '1.5-110', 'EL15'),
  alternator(P, S, '1.5-110', 'EL15'),

  // ========================================
  // EJ203 — 2.0 атмо (140 л.с.) — GE
  // MPI, без ТНВД, без турбо
  // ========================================
  engine(P, S, '2.0-140', 'EJ203', 140),
  starter(P, S, '2.0-140', 'EJ203'),
  alternator(P, S, '2.0-140', 'EJ203'),

  // ========================================
  // FB16 — 1.6 атмо GDI (115 л.с.) — GJ, GK
  // GDI (непосредственный впрыск), с ТНВД, без турбо
  // ========================================
  engine(P, S, '1.6-115', 'FB16', 115),
  starter(P, S, '1.6-115', 'FB16'),
  alternator(P, S, '1.6-115', 'FB16'),
  fuelPumpHP(P, S, '1.6-115'),

  // ========================================
  // FB20A — 2.0 атмо MPI (150 л.с.) — GJ
  // MPI, без ТНВД, без турбо → shared с Forester
  // ========================================
  engine(P, S, '2.0-150', 'FB20', 150, ['FB20']),
  starter(P, S, '2.0-150', 'FB20'),
  alternator(P, S, '2.0-150', 'FB20'),

  // ========================================
  // FB20C — 2.0 GDI (154 л.с.) — GK
  // GDI (непосредственный впрыск), с ТНВД → shared с Forester
  // ========================================
  engine(P, S, '2.0-154', 'FB20', 154, ['FB20']),
  starter(P, S, '2.0-154', 'FB20'),
  alternator(P, S, '2.0-154', 'FB20'),
  fuelPumpHP(P, S, '2.0-154'),

  // ========================================
  // КПП
  // ========================================
  transmission(P, S, 'mt', 'МКПП 5-ступ'),
  transmission(P, S, 'at4', 'АКПП 4-ступ (4EAT)', ['4EAT']),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'cvt', 'Вариатор Lineartronic (TR580)', ['TR580']),
  ecuTransmission(P, S, 'cvt'),

  // ========================================
  // Привод
  // ========================================
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
] as (PartData | SharedPartRef)[]

const generations: GenerationData[] = [
  {
    name: 'V (GK/GT) (2016-2022)',
    slug: 'gk',
    yearStart: 2016,
    yearEnd: 2022,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-115', 'engine:2.0-154',
      'transmission:cvt',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: 'IV (GJ/GP) (2011-2016)',
    slug: 'gj',
    yearStart: 2011,
    yearEnd: 2016,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-115', 'engine:2.0-150',
      'transmission:mt', 'transmission:cvt',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: 'III (GE/GH) (2007-2012)',
    slug: 'ge',
    yearStart: 2007,
    yearEnd: 2012,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.5-110', 'engine:2.0-140',
      'transmission:mt', 'transmission:at4',
      'drivetrain:fwd', 'drivetrain:awd',
    ],
  },
  {
    name: 'II (GD) (2000-2007)',
    slug: 'gd',
    yearStart: 2000,
    yearEnd: 2007,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-125', 'engine:1.5-105', 'engine:2.0-160',
      'transmission:mt', 'transmission:at4',
      'drivetrain:awd',
    ],
  },
]

export const subaruImprezaSeed = {
  brand: {
    name: 'Subaru',
    slug: 'subaru',
    logo: 'M12 4.983c3.004 0 6.224.612 8.786 2.239C22.451 8.286 24 9.9 24 12.002c0 2.456-2.097 4.242-4.106 5.287-2.391 1.238-5.216 1.728-7.894 1.728-3.003 0-6.217-.605-8.78-2.238C1.556 15.714 0 14.101 0 12.003 0 9.536 2.092 7.757 4.106 6.71 6.504 5.474 9.323 4.983 12 4.983zm-.025.746c-2.793 0-5.802.523-8.225 1.983-1.524.912-3.03 2.347-3.03 4.253 0 2.239 2.04 3.806 3.864 4.706 2.258 1.102 4.897 1.53 7.391 1.53 2.798 0 5.809-.523 8.232-1.983 1.517-.918 3.029-2.346 3.029-4.253 0-2.243-2.035-3.813-3.864-4.705-2.258-1.104-4.898-1.53-7.397-1.53zm-10.54 4.686l4.597-.784 1.384-3.003L8.794 9.63l4.596.784-4.596.792-1.378 3.01-1.384-3.01zm10.106 2.289l2.028-.356.605-1.359.606 1.359 2.028.356-2.028.35-.606 1.36-.605-1.36zm4.196-3.621l2.028-.35.605-1.365.606 1.364 2.028.35-2.028.357-.606 1.36-.606-1.36zM13.57 15.51l2.02-.35.607-1.365.612 1.365 2.027.35-2.027.357-.612 1.36-.606-1.36zm-6.23.491l2.028-.35.612-1.366.605 1.366 2.028.35-2.028.357-.605 1.359-.612-1.359zm10.196-3.353l2.022-.357.605-1.359.612 1.359 2.028.357-2.028.35-.612 1.357-.606-1.357Z',
    sortOrder: 15,
  },
  model: { name: 'Impreza', slug: 'impreza', isPopular: false, sortOrder: 2 },
  generations,
  getPartsForGeneration(generation: GenerationData): (PartData | SharedPartRef)[] {
    const allParts: (PartData | SharedPartRef)[] = [...getBaseParts(P, S), ...modelSpecificParts]
    return allParts.filter((part) => {
      const cg = isSharedPartRef(part) ? part.configGroup : part.configGroup
      if (!cg) return true
      if (!generation.availableConfigs) return true
      return generation.availableConfigs.includes(cg)
    })
  },
}
