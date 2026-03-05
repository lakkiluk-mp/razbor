import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainRWD, drivetrainAWD, fuelPumpHP, injectorsDiesel, turbo, intercooler, supercharger } from './builders'

const P = 'mercedes-e-class'
const S = ['e class', 'е класс', 'e-class']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === W211 Petrol engines ===
  // M271 1.8 163hp (Kompressor MPI — supercharger, no TNVD)
  engine(P, S, '1.8-163', 'M271', 163, ['271948']),
  starter(P, S, '1.8-163'),
  alternator(P, S, '1.8-163'),
  supercharger(P, S, '1.8-163', 'M271'),
  intercooler(P, S, '1.8-163'),
  // M112 2.6 V6 170hp (atmo MPI)
  engine(P, S, '2.6-170', 'M112', 170, ['112912']),
  starter(P, S, '2.6-170'),
  alternator(P, S, '2.6-170'),
  // M112 3.2 V6 218hp (atmo MPI)
  engine(P, S, '3.2-218', 'M112', 218, ['112946']),
  starter(P, S, '3.2-218'),
  alternator(P, S, '3.2-218'),
  // M272 2.5 V6 204hp (atmo MPI)
  engine(P, S, '2.5-204', 'M272', 204, ['272922']),
  starter(P, S, '2.5-204'),
  alternator(P, S, '2.5-204'),
  // M272 3.0 V6 231hp (atmo MPI)
  engine(P, S, '3.0-231', 'M272', 231, ['272947']),
  starter(P, S, '3.0-231'),
  alternator(P, S, '3.0-231'),
  // M272 3.5 V6 272hp (atmo MPI)
  engine(P, S, '3.5-272', 'M272', 272, ['272948']),
  starter(P, S, '3.5-272'),
  alternator(P, S, '3.5-272'),
  // M113 5.0 V8 306hp (atmo MPI)
  engine(P, S, '5.0-306', 'M113', 306, ['113960']),
  starter(P, S, '5.0-306'),
  alternator(P, S, '5.0-306'),

  // === W211 Diesel engines ===
  // OM646 2.2 CDI 150hp
  engine(P, S, '2.2d-150', 'OM646', 150, ['OM646']),
  starter(P, S, '2.2d-150'),
  alternator(P, S, '2.2d-150'),
  fuelPumpHP(P, S, '2.2d-150'),
  injectorsDiesel(P, S, '2.2d-150'),
  turbo(P, S, '2.2d-150', 'OM646'),
  intercooler(P, S, '2.2d-150'),
  // OM642 3.0 V6 CDI 224hp
  engine(P, S, '3.0d-224', 'OM642', 224, ['OM642']),
  starter(P, S, '3.0d-224'),
  alternator(P, S, '3.0d-224'),
  fuelPumpHP(P, S, '3.0d-224'),
  injectorsDiesel(P, S, '3.0d-224'),
  turbo(P, S, '3.0d-224', 'OM642'),
  intercooler(P, S, '3.0d-224'),

  // === W212 Petrol engines ===
  // M271 EVO 1.8 184hp (turbo GDI)
  engine(P, S, '1.8-184', 'M271', 184, ['271820']),
  starter(P, S, '1.8-184'),
  alternator(P, S, '1.8-184'),
  fuelPumpHP(P, S, '1.8-184'),
  supercharger(P, S, '1.8-184', 'M271'),
  intercooler(P, S, '1.8-184'),
  // M272 3.5 V6 272hp (atmo MPI)
  // already defined above — shared via configGroup
  // M274 2.0 184hp (turbo GDI)
  engine(P, S, '2.0-184', 'M274', 184, ['274920']),
  starter(P, S, '2.0-184'),
  alternator(P, S, '2.0-184'),
  fuelPumpHP(P, S, '2.0-184'),
  turbo(P, S, '2.0-184', 'M274'),
  intercooler(P, S, '2.0-184'),
  // M276 3.5 V6 306hp (biturbo GDI)
  engine(P, S, '3.5-306', 'M276', 306, ['276957']),
  starter(P, S, '3.5-306'),
  alternator(P, S, '3.5-306'),
  fuelPumpHP(P, S, '3.5-306'),
  turbo(P, S, '3.5-306', 'M276', 'A2760900300', 'left'),
  turbo(P, S, '3.5-306', 'M276', 'A2760900400', 'right'),
  intercooler(P, S, '3.5-306'),

  // === W212 Diesel engines ===
  // OM651 2.2 CDI 170hp
  engine(P, S, '2.2d-170', 'OM651', 170, ['OM651']),
  starter(P, S, '2.2d-170'),
  alternator(P, S, '2.2d-170'),
  fuelPumpHP(P, S, '2.2d-170'),
  injectorsDiesel(P, S, '2.2d-170'),
  turbo(P, S, '2.2d-170', 'OM651'),
  intercooler(P, S, '2.2d-170'),
  // OM642 3.0 V6 CDI 252hp (same family as W211 but higher tune)
  engine(P, S, '3.0d-252', 'OM642', 252, ['OM642']),
  starter(P, S, '3.0d-252'),
  alternator(P, S, '3.0d-252'),
  fuelPumpHP(P, S, '3.0d-252'),
  injectorsDiesel(P, S, '3.0d-252'),
  turbo(P, S, '3.0d-252', 'OM642'),
  intercooler(P, S, '3.0d-252'),

  // === W213 Petrol engines ===
  // M264 2.0 204hp (turbo GDI)
  engine(P, S, '2.0-204', 'M264', 204, ['264920']),
  starter(P, S, '2.0-204'),
  alternator(P, S, '2.0-204'),
  fuelPumpHP(P, S, '2.0-204'),
  turbo(P, S, '2.0-204', 'M264'),
  intercooler(P, S, '2.0-204'),
  // M264 2.0 249hp (same OEM, higher tune)
  engine(P, S, '2.0-249', 'M264', 249, ['264920']),
  starter(P, S, '2.0-249'),
  alternator(P, S, '2.0-249'),
  fuelPumpHP(P, S, '2.0-249'),
  turbo(P, S, '2.0-249', 'M264'),
  intercooler(P, S, '2.0-249'),

  // === W213 Diesel engines ===
  // OM654 2.0 CDI 194hp
  engine(P, S, '2.0d-194', 'OM654', 194, ['OM654']),
  starter(P, S, '2.0d-194'),
  alternator(P, S, '2.0d-194'),
  fuelPumpHP(P, S, '2.0d-194'),
  injectorsDiesel(P, S, '2.0d-194'),
  turbo(P, S, '2.0d-194', 'OM654'),
  intercooler(P, S, '2.0d-194'),

  // === Transmissions ===
  transmission(P, S, 'mt6', 'МКПП 6-ступ', ['716.6']),
  transmission(P, S, 'at5', 'АКПП 5-ступ', ['722.6']),
  ecuTransmission(P, S, 'at5'),
  transmission(P, S, 'at7', 'АКПП 7-ступ', ['722.9']),
  ecuTransmission(P, S, 'at7'),
  transmission(P, S, 'at9', 'АКПП 9-ступ', ['725.0']),
  ecuTransmission(P, S, 'at9'),

  // === Drivetrain ===
  ...drivetrainRWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'V (W213) (2016-н.в.)',
    slug: 'w213',
    yearStart: 2016,
    yearEnd: null,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-204',
      'engine:2.0-249',
      'engine:2.0d-194',
      'transmission:at9',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'IV (W212) (2009-2016)',
    slug: 'w212',
    yearStart: 2009,
    yearEnd: 2016,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-184',
      'engine:3.5-272',
      'engine:2.0-184',
      'engine:3.5-306',
      'engine:2.2d-170',
      'engine:3.0d-252',
      'transmission:mt6',
      'transmission:at7',
      'transmission:at9',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'III (W211) (2002-2009)',
    slug: 'w211',
    yearStart: 2002,
    yearEnd: 2009,
    bodyType: 'sedan' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:1.8-163',
      'engine:2.6-170',
      'engine:3.2-218',
      'engine:2.5-204',
      'engine:3.0-231',
      'engine:3.5-272',
      'engine:5.0-306',
      'engine:2.2d-150',
      'engine:3.0d-224',
      'transmission:mt5',
      'transmission:mt6',
      'transmission:at5',
      'transmission:at7',
      'drivetrain:rwd',
      'drivetrain:awd',
    ],
  },
]

export const mercedesEClassSeed = {
  brand: {
    name: 'Mercedes-Benz',
    slug: 'mercedes-benz',
    logo: 'M17.58,1.35C15.9,0.48,14.01,0,12,0c-2.01,0-3.9,0.48-5.58,1.35v0C2.61,3.36,0,7.38,0,12c0,4.62,2.61,8.64,6.45,10.65C8.1,23.49,9.99,24,12,24c2.01,0,3.87-0.51,5.55-1.38C21.39,20.64,24,16.62,24,12C24,7.38,21.39,3.36,17.58,1.35z M1.2,12c0-3.93,2.1-7.35,5.25-9.27v0C7.98,1.8,9.75,1.26,11.7,1.2l-1.35,9.81L6.45,14.04v0L2.49,17.13C1.68,15.6,1.2,13.86,1.2,12z M17.58,21.24C15.93,22.23,14.04,22.8,12,22.8c-2.04,0-3.96-0.57-5.58-1.56c-1.47-0.87-2.67-2.07-3.57-3.51l3.57-1.47v0L12,13.98l5.58,2.25v0l3.6,1.47C20.28,19.17,19.02,20.37,17.58,21.24z M17.58,14.04L17.58,14.04l-3.87-3L12.33,1.2c1.89,0.06,3.69,0.6,5.22,1.53v0C20.7,4.62,22.8,8.07,22.8,12c0,1.86-0.45,3.6-1.29,5.13L17.58,14.04z',
    sortOrder: 3,
  },

  model: {
    name: 'E-Class',
    slug: 'e-class',
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
