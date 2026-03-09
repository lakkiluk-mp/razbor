import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainAWD, fuelPumpHP, injectorsDiesel, turbo, intercooler, supercharger } from './builders'

const P = 'mercedes-m-class'
const S = ['m class', 'м класс', 'ml', 'мл']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === W163 Petrol engines ===
  // M111 2.3 150hp (atmo MPI — ML 230)
  engine(P, S, '2.3-150', 'M111', 150, ['111977']),
  starter(P, S, '2.3-150'),
  alternator(P, S, '2.3-150'),
  // M112 3.2 V6 215hp (atmo MPI — ML 320)
  engine(P, S, '3.2-215', 'M112', 215, ['112941']),
  starter(P, S, '3.2-215'),
  alternator(P, S, '3.2-215'),
  // M112 3.7 V6 245hp (atmo MPI — ML 350 рестайл)
  engine(P, S, '3.7-245', 'M112', 245, ['112973']),
  starter(P, S, '3.7-245'),
  alternator(P, S, '3.7-245'),
  // M113 4.3 V8 279hp (atmo MPI — ML 430)
  engine(P, S, '4.3-279', 'M113', 279, ['113941']),
  starter(P, S, '4.3-279'),
  alternator(P, S, '4.3-279'),
  // M113 5.0 V8 306hp (atmo MPI — ML 500 рестайл)
  engine(P, S, '5.0-306', 'M113', 306, ['113960']),
  starter(P, S, '5.0-306'),
  alternator(P, S, '5.0-306'),
  // M113 5.4 V8 AMG 347hp (supercharger — ML 55 AMG)
  engine(P, S, '5.4-347', 'M113', 347, ['113981']),
  starter(P, S, '5.4-347'),
  alternator(P, S, '5.4-347'),
  supercharger(P, S, '5.4-347', 'M113'),
  intercooler(P, S, '5.4-347'),

  // === W163 Diesel engines ===
  // OM612 2.7 CDI 163hp (ML 270 CDI)
  engine(P, S, '2.7d-163', 'OM612', 163, ['OM612']),
  starter(P, S, '2.7d-163'),
  alternator(P, S, '2.7d-163'),
  fuelPumpHP(P, S, '2.7d-163'),
  injectorsDiesel(P, S, '2.7d-163'),
  turbo(P, S, '2.7d-163', 'OM612'),
  intercooler(P, S, '2.7d-163'),
  // OM628 4.0 CDI V8 250hp (ML 400 CDI рестайл)
  engine(P, S, '4.0d-250', 'OM628', 250, ['OM628']),
  starter(P, S, '4.0d-250'),
  alternator(P, S, '4.0d-250'),
  fuelPumpHP(P, S, '4.0d-250'),
  injectorsDiesel(P, S, '4.0d-250'),
  turbo(P, S, '4.0d-250', 'OM628'),
  intercooler(P, S, '4.0d-250'),

  // === W164 Petrol engines ===
  // M272 3.5 V6 272hp (atmo MPI — ML 350)
  engine(P, S, '3.5-272', 'M272', 272, ['272948']),
  starter(P, S, '3.5-272'),
  alternator(P, S, '3.5-272'),
  // M273 5.5 V8 388hp (atmo MPI — ML 500)
  engine(P, S, '5.5-388', 'M273', 388, ['273961']),
  starter(P, S, '5.5-388'),
  alternator(P, S, '5.5-388'),
  // M156 6.2 V8 510hp (atmo — ML 63 AMG)
  engine(P, S, '6.2-510', 'M156', 510, ['156985']),
  starter(P, S, '6.2-510'),
  alternator(P, S, '6.2-510'),

  // === W164 Diesel engines ===
  // OM642 3.0 V6 CDI 224hp (ML 320 CDI / ML 350 CDI)
  engine(P, S, '3.0d-224', 'OM642', 224, ['OM642']),
  starter(P, S, '3.0d-224'),
  alternator(P, S, '3.0d-224'),
  fuelPumpHP(P, S, '3.0d-224'),
  injectorsDiesel(P, S, '3.0d-224'),
  turbo(P, S, '3.0d-224', 'OM642'),
  intercooler(P, S, '3.0d-224'),
  // OM629 4.0 CDI V8 306hp (ML 420 CDI)
  engine(P, S, '4.0d-306', 'OM629', 306, ['OM629']),
  starter(P, S, '4.0d-306'),
  alternator(P, S, '4.0d-306'),
  fuelPumpHP(P, S, '4.0d-306'),
  injectorsDiesel(P, S, '4.0d-306'),
  turbo(P, S, '4.0d-306', 'OM629'),
  intercooler(P, S, '4.0d-306'),

  // === W166 Petrol engines ===
  // M276 3.5 V6 306hp (atmo/GDI — ML 350)
  engine(P, S, '3.5-306', 'M276', 306, ['276957']),
  starter(P, S, '3.5-306'),
  alternator(P, S, '3.5-306'),
  fuelPumpHP(P, S, '3.5-306'),
  // M276 3.0T V6 333hp (biturbo GDI — ML 400)
  engine(P, S, '3.0-333', 'M276', 333, ['276821']),
  starter(P, S, '3.0-333'),
  alternator(P, S, '3.0-333'),
  fuelPumpHP(P, S, '3.0-333'),
  turbo(P, S, '3.0-333', 'M276', 'A2760900300', 'left'),
  turbo(P, S, '3.0-333', 'M276', 'A2760900400', 'right'),
  intercooler(P, S, '3.0-333'),
  // M278 4.7 V8 408hp (biturbo GDI — ML 500)
  engine(P, S, '4.7-408', 'M278', 408, ['278929']),
  starter(P, S, '4.7-408'),
  alternator(P, S, '4.7-408'),
  fuelPumpHP(P, S, '4.7-408'),
  turbo(P, S, '4.7-408', 'M278', 'A2780903580', 'left'),
  turbo(P, S, '4.7-408', 'M278', 'A2780901880', 'right'),
  intercooler(P, S, '4.7-408'),
  // M157 5.5T V8 525hp (biturbo GDI — ML 63 AMG)
  engine(P, S, '5.5-525', 'M157', 525, ['157982']),
  starter(P, S, '5.5-525'),
  alternator(P, S, '5.5-525'),
  fuelPumpHP(P, S, '5.5-525'),
  turbo(P, S, '5.5-525', 'M157', undefined, 'left'),
  turbo(P, S, '5.5-525', 'M157', undefined, 'right'),
  intercooler(P, S, '5.5-525'),

  // === W166 Diesel engines ===
  // OM651 2.1 CDI 204hp (ML 250 BlueTEC)
  engine(P, S, '2.1d-204', 'OM651', 204, ['OM651']),
  starter(P, S, '2.1d-204'),
  alternator(P, S, '2.1d-204'),
  fuelPumpHP(P, S, '2.1d-204'),
  injectorsDiesel(P, S, '2.1d-204'),
  turbo(P, S, '2.1d-204', 'OM651'),
  intercooler(P, S, '2.1d-204'),
  // OM642 3.0 V6 CDI 258hp (ML 350 BlueTEC)
  engine(P, S, '3.0d-258', 'OM642', 258, ['OM642']),
  starter(P, S, '3.0d-258'),
  alternator(P, S, '3.0d-258'),
  fuelPumpHP(P, S, '3.0d-258'),
  injectorsDiesel(P, S, '3.0d-258'),
  turbo(P, S, '3.0d-258', 'OM642'),
  intercooler(P, S, '3.0d-258'),

  // === Transmissions ===
  transmission(P, S, 'at5', 'АКПП 5-ступ', ['722.6']),
  ecuTransmission(P, S, 'at5'),
  transmission(P, S, 'at7', 'АКПП 7-ступ', ['722.9']),
  ecuTransmission(P, S, 'at7'),

  // === Drivetrain ===
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'III (W166) (2011-2015)',
    slug: 'w166',
    yearStart: 2011,
    yearEnd: 2015,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.5-306',
      'engine:3.0-333',
      'engine:4.7-408',
      'engine:5.5-525',
      'engine:2.1d-204',
      'engine:3.0d-258',
      'transmission:at7',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (W164) (2005-2011)',
    slug: 'w164',
    yearStart: 2005,
    yearEnd: 2011,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.5-272',
      'engine:5.5-388',
      'engine:6.2-510',
      'engine:3.0d-224',
      'engine:4.0d-306',
      'transmission:at5',
      'transmission:at7',
      'drivetrain:awd',
    ],
  },
  {
    name: 'I (W163) (1997-2005)',
    slug: 'w163',
    yearStart: 1997,
    yearEnd: 2005,
    bodyType: 'suv' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.3-150',
      'engine:3.2-215',
      'engine:3.7-245',
      'engine:4.3-279',
      'engine:5.0-306',
      'engine:5.4-347',
      'engine:2.7d-163',
      'engine:4.0d-250',
      'transmission:at5',
      'drivetrain:awd',
    ],
  },
]

export const mercedesMClassSeed = {
  brand: {
    name: 'Mercedes-Benz',
    slug: 'mercedes-benz',
    logo: 'M17.58,1.35C15.9,0.48,14.01,0,12,0c-2.01,0-3.9,0.48-5.58,1.35v0C2.61,3.36,0,7.38,0,12c0,4.62,2.61,8.64,6.45,10.65C8.1,23.49,9.99,24,12,24c2.01,0,3.87-0.51,5.55-1.38C21.39,20.64,24,16.62,24,12C24,7.38,21.39,3.36,17.58,1.35z M1.2,12c0-3.93,2.1-7.35,5.25-9.27v0C7.98,1.8,9.75,1.26,11.7,1.2l-1.35,9.81L6.45,14.04v0L2.49,17.13C1.68,15.6,1.2,13.86,1.2,12z M17.58,21.24C15.93,22.23,14.04,22.8,12,22.8c-2.04,0-3.96-0.57-5.58-1.56c-1.47-0.87-2.67-2.07-3.57-3.51l3.57-1.47v0L12,13.98l5.58,2.25v0l3.6,1.47C20.28,19.17,19.02,20.37,17.58,21.24z M17.58,14.04L17.58,14.04l-3.87-3L12.33,1.2c1.89,0.06,3.69,0.6,5.22,1.53v0C20.7,4.62,22.8,8.07,22.8,12c0,1.86-0.45,3.6-1.29,5.13L17.58,14.04z',
    sortOrder: 3,
  },

  model: {
    name: 'M-Class',
    slug: 'm-class',
    isPopular: false,
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
