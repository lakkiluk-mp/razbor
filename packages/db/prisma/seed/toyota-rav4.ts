import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import {
  engine, starter, alternator, transmission, ecuTransmission,
  drivetrainFWD, drivetrainAWD, fuelPumpHP, turbo, intercooler, injectorsDiesel,
} from './builders'

const P = 'toyota-rav4'
const S = ['toyota rav4', 'тойота рав4', 'рав4', 'rav4']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // XA50: M20A-FKS 2.0 (shared with Camry, GDI)
  engine(P, S, '2.0-149', 'M20A-FKS', 149, ['190003Y280']),
  starter(P, S, '2.0-149'),
  alternator(P, S, '2.0-149'),
  fuelPumpHP(P, S, '2.0-149'),
  // XA50: A25A-FKS 2.5 (shared with Camry, GDI)
  engine(P, S, '2.5-199', 'A25A-FKS', 199, ['19000F0010']),
  starter(P, S, '2.5-199'),
  alternator(P, S, '2.5-199'),
  fuelPumpHP(P, S, '2.5-199'),

  // XA40: 3ZR-FE 2.0 (local)
  engine(P, S, '2.0-146', '3ZR-FE', 146),
  starter(P, S, '2.0-146'),
  alternator(P, S, '2.0-146'),
  // XA40: 2AR-FE 2.5 (shared with Camry)
  engine(P, S, '2.5-180', '2AR-FE', 180, ['190000V010']),
  starter(P, S, '2.5-180'),
  alternator(P, S, '2.5-180'),
  // XA40: 2AD-FTV 2.2D (diesel, local)
  engine(P, S, '2.2d-150', '2AD-FTV', 150),
  starter(P, S, '2.2d-150'),
  alternator(P, S, '2.2d-150'),
  fuelPumpHP(P, S, '2.2d-150'),
  turbo(P, S, '2.2d-150', '2AD-FTV'),
  intercooler(P, S, '2.2d-150'),
  injectorsDiesel(P, S, '2.2d-150'),

  // XA30: 1AZ-FE 2.0 (local)
  engine(P, S, '2.0-152', '1AZ-FE', 152),
  starter(P, S, '2.0-152'),
  alternator(P, S, '2.0-152'),
  // XA30: 2AZ-FE 2.4 (shared with Camry)
  engine(P, S, '2.4-170', '2AZ-FE', 170, ['1900028D00']),
  starter(P, S, '2.4-170'),
  alternator(P, S, '2.4-170'),

  // КПП
  transmission(P, S, 'mt5', 'МКПП 5-ступ'),
  transmission(P, S, 'mt6', 'МКПП 6-ступ'),
  transmission(P, S, 'cvt-k120', 'Direct Shift-CVT K120', ['3040012760']),
  ecuTransmission(P, S, 'cvt-k120'),
  transmission(P, S, 'cvt-k313', 'Вариатор CVT K313'),
  ecuTransmission(P, S, 'cvt-k313'),
  transmission(P, S, 'at4', 'АКПП 4-ступ'),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'at6', 'АКПП 6-ступ U660E'),
  ecuTransmission(P, S, 'at6'),
  transmission(P, S, 'at8', 'АКПП 8-ступ'),
  ecuTransmission(P, S, 'at8'),

  // Привод
  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'V (XA50) (2018-2024)',
    slug: 'xa50',
    yearStart: 2018,
    yearEnd: 2024,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-149',
      'engine:2.5-199',
      'transmission:mt6',
      'transmission:cvt-k120',
      'transmission:at8',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'IV (XA40) (2012-2019)',
    slug: 'xa40',
    yearStart: 2012,
    yearEnd: 2019,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-146',
      'engine:2.5-180',
      'engine:2.2d-150',
      'transmission:mt6',
      'transmission:cvt-k313',
      'transmission:at6',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'III (XA30) (2005-2013)',
    slug: 'xa30',
    yearStart: 2005,
    yearEnd: 2013,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-152',
      'engine:2.4-170',
      'transmission:mt5',
      'transmission:at4',
      'drivetrain:awd',
    ],
  },
]

export const toyotaRav4Seed = {
  brand: {
    name: 'Toyota',
    slug: 'toyota',
    logo: 'M12 3.848C5.223 3.848 0 7.298 0 12c0 4.702 5.224 8.152 12 8.152S24 16.702 24 12c0-4.702-5.223-8.152-12-8.152zm7.334 3.839c0 1.08-1.725 1.913-4.488 2.246-.26-2.58-1.005-4.279-1.963-4.913 2.948.184 6.45 1.227 6.45 2.667zM12 16.401c-.96 0-1.746-1.5-1.808-4.389.577.047 1.18.072 1.808.072.628 0 1.23-.025 1.807-.072-.061 2.89-.847 4.389-1.807 4.389zm0-6.308c-.59 0-1.155-.019-1.69-.054.261-1.728.92-3.15 1.69-3.15.77 0 1.428 1.422 1.689 3.15-.535.034-1.099.054-1.689.054zm-.882-5.075c-.956.633-1.706 2.333-1.964 4.915C6.391 9.6 4.665 8.767 4.665 7.687c0-1.44 3.504-2.49 6.453-2.669zM2.037 11.68a5.265 5.265 0 011.048-3.164c.27 1.547 2.522 2.881 5.972 3.37V12c0 3.772.879 6.203 2.087 6.97-5.107-.321-9.107-3.48-9.107-7.29zm10.823 7.29c1.207-.767 2.087-3.198 2.087-6.97v-.115c3.447-.488 5.704-1.826 5.972-3.37a5.26 5.26 0 011.049 3.165c-.004 3.81-4.008 6.969-9.109 7.29z',
    sortOrder: 11,
  },

  model: {
    name: 'RAV4',
    slug: 'rav4',
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
