import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, fuelPumpHP, injectorsDiesel, transmission, ecuTransmission, drivetrainFWD, turbo, intercooler } from './builders'

const P = 'opel-astra'
const S = ['opel astra', 'опель астра', 'астра', 'astra']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '1.4-90', 'Z14XEP', 90),
  engine(P, S, '1.6-115z', 'Z16XER', 115),
  engine(P, S, '1.8-140', 'Z18XER', 140, ['93185848']),

  engine(P, S, '1.9d-120', 'Z19DTL', 120),
  fuelPumpHP(P, S, '1.9d-120'),
  injectorsDiesel(P, S, '1.9d-120'),
  turbo(P, S, '1.9d-120', 'Z19DTL'),
  intercooler(P, S, '1.9d-120'),
  engine(P, S, '1.9d-150', 'Z19DTH', 150),
  fuelPumpHP(P, S, '1.9d-150'),
  injectorsDiesel(P, S, '1.9d-150'),
  turbo(P, S, '1.9d-150', 'Z19DTH'),
  intercooler(P, S, '1.9d-150'),

  engine(P, S, '1.4-100', 'A14XER', 100),
  engine(P, S, '1.4t-140', 'A14NET', 140),
  fuelPumpHP(P, S, '1.4t-140'),
  turbo(P, S, '1.4t-140', 'A14NET'),
  intercooler(P, S, '1.4t-140'),
  engine(P, S, '1.6-115', 'A16XER', 115),

  transmission(P, S, 'mt5', 'МКПП 5-ступ (F17)', ['55565138']),
  transmission(P, S, 'mt6', 'МКПП 6-ступ (M32)', ['55192042']),
  transmission(P, S, 'at4', 'АКПП 4-ступ (Aisin AF17)'),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'robot', 'Робот Easytronic'),
  ecuTransmission(P, S, 'robot'),
  transmission(P, S, 'at6', 'АКПП 6-ступ (6T30/6T40)'),
  ecuTransmission(P, S, 'at6'),

  ...drivetrainFWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'H (L48) (2004-2014)',
    slug: 'h',
    yearStart: 2004,
    yearEnd: 2014,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-90',
      'engine:1.6-115z',
      'engine:1.8-140',
      'engine:1.9d-120',
      'engine:1.9d-150',
      'transmission:mt5',
      'transmission:mt6',
      'transmission:at4',
      'transmission:robot',
      'drivetrain:fwd',
    ],
  },
  {
    name: 'J (P10) (2009-2015)',
    slug: 'j',
    yearStart: 2009,
    yearEnd: 2015,
    bodyType: 'hatchback' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.4-100',
      'engine:1.4t-140',
      'engine:1.6-115',
      'transmission:mt5',
      'transmission:mt6',
      'transmission:at6',
      'drivetrain:fwd',
    ],
  },
]

export const opelAstraSeed = {
  brand: {
    name: 'Opel',
    slug: 'opel',
    logo: 'M12.291 4.57a7.46 7.46 0 0 0-7.338 5.006h.568a6.926 6.926 0 0 1 6.483-4.494 6.922 6.922 0 0 1 6.922 6.924c0 .116 0 .234-.01.351l.533.059c0-.134.01-.273.01-.4a7.46 7.46 0 0 0-7.168-7.446zM.869 10.113 0 10.566l13.25 1.44 3.63-1.893H.87zm3.682 1.483v.41a7.46 7.46 0 0 0 14.498 2.441h-.57a6.924 6.924 0 0 1-6.475 4.487 6.928 6.928 0 0 1-6.92-6.928v-.352l-.533-.058zm6.193.414-3.63 1.898h16.011l.873-.453v-.006l-13.254-1.44zm13.254 1.44H24l-.002-.007v.006z',
    sortOrder: 15,
  },

  model: {
    name: 'Astra',
    slug: 'astra',
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
