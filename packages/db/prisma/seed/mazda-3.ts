import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainFWD, fuelPumpHP, turbo, intercooler, injectorsDiesel } from './builders'

const P = 'mazda-3'
const S = ['mazda 3', 'мазда 3', 'mazda3', 'мазда3']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.6-105', 'Z6', 105),
  starter(P, S, '1.6-105'),
  alternator(P, S, '1.6-105'),

  engine(P, S, '2.0-lf-150', 'LF', 150, ['LF1702300']),
  starter(P, S, '2.0-lf-150'),
  alternator(P, S, '2.0-lf-150'),

  engine(P, S, '1.5-120', 'SKYACTIV-G', 120),
  starter(P, S, '1.5-120'),
  alternator(P, S, '1.5-120'),
  fuelPumpHP(P, S, '1.5-120'),

  engine(P, S, '2.0-150', 'SKYACTIV-G', 150, ['PEY502300']),
  starter(P, S, '2.0-150'),
  alternator(P, S, '2.0-150'),
  fuelPumpHP(P, S, '2.0-150'),

  engine(P, S, '2.5-192', 'SKYACTIV-G', 192, ['PYZC02300']),
  starter(P, S, '2.5-192'),
  alternator(P, S, '2.5-192'),
  fuelPumpHP(P, S, '2.5-192'),

  engine(P, S, '2.2d-150', 'SH-VPTS', 150),
  starter(P, S, '2.2d-150'),
  alternator(P, S, '2.2d-150'),
  fuelPumpHP(P, S, '2.2d-150'),
  injectorsDiesel(P, S, '2.2d-150'),
  turbo(P, S, '2.2d-150', 'SKYACTIV-D'),
  intercooler(P, S, '2.2d-150'),

  transmission(P, S, 'mt5', 'МКПП 5-ступ', ['G61117150']),
  transmission(P, S, 'at4', 'АКПП 4-ступ (FN4A-EL)'),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'at5', 'АКПП 5-ступ', ['FS5AEL']),
  ecuTransmission(P, S, 'at5'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at6', 'АКПП 6-ступ', ['FW6AEL']),
  ecuTransmission(P, S, 'at6'),

  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'III (BM) (2013-2019)',
    slug: 'bm',
    yearStart: 2013,
    yearEnd: 2019,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.5-120',
      'engine:2.0-150',
      'engine:2.5-192',
      'engine:2.2d-150',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (BL) (2009-2013)',
    slug: 'bl',
    yearStart: 2009,
    yearEnd: 2013,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-105',
      'engine:2.0-lf-150',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'I (BK) (2003-2009)',
    slug: 'bk',
    yearStart: 2003,
    yearEnd: 2009,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.6-105',
      'engine:2.0-lf-150',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:fwd',
    ],
  },
]

export const mazda3Seed = {
  brand: {
    name: 'Mazda',
    slug: 'mazda',
    logo: 'M11.999 12.876c-.036 0-.105-.046-.222-.26a7.531 7.531 0 00-1.975-2.353A8.255 8.255 0 007.7 9.065a17.945 17.945 0 00-.345-.136c-1.012-.4-2.061-.813-3.035-1.377A8.982 8.982 0 014 7.362c.194-.34.42-.665.67-.962a6.055 6.055 0 011.253-1.131 7.126 7.126 0 011.618-.806c1.218-.434 2.677-.647 4.458-.649 1.783.002 3.241.215 4.459.65a7.097 7.097 0 011.619.805c.471.319.892.699 1.253 1.13.25.298.475.623.67.963-.103.064-.212.129-.32.192-.976.564-2.023.977-3.037 1.376l-.345.136a8.26 8.26 0 00-2.1 1.198 7.519 7.519 0 00-1.975 2.354c-.117.213-.187.259-.224.259m0 7.072c-1.544-.002-2.798-.129-3.83-.387-1.013-.252-1.855-.64-2.576-1.188a5.792 5.792 0 01-1.392-1.537 7.607 7.607 0 01-.81-1.768 10.298 10.298 0 01-.467-2.983c0-.674.047-1.313.135-1.901 1.106.596 2.153.895 3.08 1.16l.215.06c1.29.371 2.314.857 3.135 1.488.475.368.89.793 1.23 1.264.369.508.663 1.088.877 1.725.096.289.2.468.403.468.207 0 .308-.18.405-.468a6.124 6.124 0 012.107-2.988c.82-.632 1.845-1.118 3.135-1.489l.216-.06c.926-.265 1.973-.564 3.078-1.16.09.589.136 1.227.136 1.9 0 .458-.046 1.664-.465 2.984a7.626 7.626 0 01-.809 1.768 5.789 5.789 0 01-1.396 1.537c-.723.548-1.565.936-2.574 1.188-1.035.258-2.288.385-3.833.387m9.692-14.556c-1.909-2.05-4.99-2.99-9.692-2.995-4.7.005-7.781.944-9.69 2.994C.89 6.913 0 9.018 0 11.874c0 1.579.39 5.6 3.564 7.676 1.9 1.242 4.354 2.046 8.435 2.052 4.083-.006 6.536-.81 8.437-2.052C23.609 17.474 24 13.452 24 11.874c0-2.848-.897-4.968-2.31-6.483Z',
    sortOrder: 1,
  },

  model: {
    name: 'Mazda3',
    slug: 'mazda3',
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
