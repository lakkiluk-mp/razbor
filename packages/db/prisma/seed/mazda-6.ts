import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, transmission, drivetrainFWD, fuelPumpHP } from './builders'

const P = 'mazda-6'
const S = ['mazda 6', 'мазда 6']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.8-120', 'L8', 120, ['L82902300']),
  engine(P, S, '2.0-141', 'LF', 141, ['LF1702300']),
  engine(P, S, '2.0-147', 'LF', 147, ['LF1702300']),
  engine(P, S, '2.3-166', 'L3', 166),
  engine(P, S, '2.5-170', 'L5', 170),
  engine(P, S, '2.0-150', 'SKYACTIV-G', 150, ['PEY502300']),
  fuelPumpHP(P, S, '2.0-150'),
  engine(P, S, '2.5-192', 'SKYACTIV-G', 192, ['PYZC02300']),
  fuelPumpHP(P, S, '2.5-192'),
  engine(P, S, '2.5t-231', 'Turbo SKYACTIV-G', 231, ['PYZE02300']),
  fuelPumpHP(P, S, '2.5t-231'),
  transmission(P, S, 'mt5', 'МКПП 5-ступ', ['G61117150']),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'at5', 'АКПП 5-ступ', ['FS5AEL', 'FNR5']),
  transmission(P, S, 'at6', 'АКПП 6-ступ', ['FW6AEL']),
  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'III (GJ) (2012-2022)',
    slug: 'gj',
    yearStart: 2012,
    yearEnd: 2022,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-150',
      'engine:2.5-192',
      'engine:2.5t-231',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'II (GH) (2007-2012)',
    slug: 'gh',
    yearStart: 2007,
    yearEnd: 2012,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-120',
      'engine:2.0-147',
      'engine:2.5-170',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'I (GG) (2002-2008)',
    slug: 'gg',
    yearStart: 2002,
    yearEnd: 2008,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-120',
      'engine:2.0-141',
      'engine:2.0-147',
      'engine:2.3-166',
      'transmission:mt5',
      'transmission:at5',
      'drivetrain:fwd',
    ],
  },
]

export const mazda6Seed = {
  brand: {
    name: 'Mazda',
    slug: 'mazda',
    logo: 'M11.999 12.876c-.036 0-.105-.046-.222-.26a7.531 7.531 0 00-1.975-2.353A8.255 8.255 0 007.7 9.065a17.945 17.945 0 00-.345-.136c-1.012-.4-2.061-.813-3.035-1.377A8.982 8.982 0 014 7.362c.194-.34.42-.665.67-.962a6.055 6.055 0 011.253-1.131 7.126 7.126 0 011.618-.806c1.218-.434 2.677-.647 4.458-.649 1.783.002 3.241.215 4.459.65a7.097 7.097 0 011.619.805c.471.319.892.699 1.253 1.13.25.298.475.623.67.963-.103.064-.212.129-.32.192-.976.564-2.023.977-3.037 1.376l-.345.136a8.26 8.26 0 00-2.1 1.198 7.519 7.519 0 00-1.975 2.354c-.117.213-.187.259-.224.259m0 7.072c-1.544-.002-2.798-.129-3.83-.387-1.013-.252-1.855-.64-2.576-1.188a5.792 5.792 0 01-1.392-1.537 7.607 7.607 0 01-.81-1.768 10.298 10.298 0 01-.467-2.983c0-.674.047-1.313.135-1.901 1.106.596 2.153.895 3.08 1.16l.215.06c1.29.371 2.314.857 3.135 1.488.475.368.89.793 1.23 1.264.369.508.663 1.088.877 1.725.096.289.2.468.403.468.207 0 .308-.18.405-.468a6.124 6.124 0 012.107-2.988c.82-.632 1.845-1.118 3.135-1.489l.216-.06c.926-.265 1.973-.564 3.078-1.16.09.589.136 1.227.136 1.9 0 .458-.046 1.664-.465 2.984a7.626 7.626 0 01-.809 1.768 5.789 5.789 0 01-1.396 1.537c-.723.548-1.565.936-2.574 1.188-1.035.258-2.288.385-3.833.387m9.692-14.556c-1.909-2.05-4.99-2.99-9.692-2.995-4.7.005-7.781.944-9.69 2.994C.89 6.913 0 9.018 0 11.874c0 1.579.39 5.6 3.564 7.676 1.9 1.242 4.354 2.046 8.435 2.052 4.083-.006 6.536-.81 8.437-2.052C23.609 17.474 24 13.452 24 11.874c0-2.848-.897-4.968-2.31-6.483Z',
    sortOrder: 1,
  },

  model: {
    name: 'Mazda6',
    slug: 'mazda6',
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
