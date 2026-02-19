import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainAWD, fuelPumpHP, injectorsDiesel, turbo, intercooler, supercharger } from './builders'

const P = 'audi-q5'
const S = ['q5', 'ку5', 'q 5']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  // === 8R Petrol engines ===
  engine(P, S, '2.0-180', 'CDNB', 180, ['06H100031R']),
  starter(P, S, '2.0-180'),
  alternator(P, S, '2.0-180'),
  fuelPumpHP(P, S, '2.0-180'),
  turbo(P, S, '2.0-180', 'CDNB'),
  intercooler(P, S, '2.0-180'),
  engine(P, S, '2.0-211', 'CDNC', 211, ['06H100035H']),
  starter(P, S, '2.0-211'),
  alternator(P, S, '2.0-211'),
  fuelPumpHP(P, S, '2.0-211'),
  turbo(P, S, '2.0-211', 'CDNC'),
  intercooler(P, S, '2.0-211'),
  engine(P, S, '2.0-225', 'CNCD', 225, ['06L100032L']),
  starter(P, S, '2.0-225'),
  alternator(P, S, '2.0-225'),
  fuelPumpHP(P, S, '2.0-225'),
  turbo(P, S, '2.0-225', 'CNCD'),
  intercooler(P, S, '2.0-225'),
  engine(P, S, '2.0-230', 'CNCE', 230, ['CNCE']),
  starter(P, S, '2.0-230'),
  alternator(P, S, '2.0-230'),
  fuelPumpHP(P, S, '2.0-230'),
  turbo(P, S, '2.0-230', 'CNCE'),
  intercooler(P, S, '2.0-230'),
  engine(P, S, '3.2-270', 'CALB', 270, ['06E100031L']),
  starter(P, S, '3.2-270'),
  alternator(P, S, '3.2-270'),
  fuelPumpHP(P, S, '3.2-270'),
  engine(P, S, '3.0-272', 'CTUC', 272, ['06E100036A']),
  starter(P, S, '3.0-272'),
  alternator(P, S, '3.0-272'),
  fuelPumpHP(P, S, '3.0-272'),
  supercharger(P, S, '3.0-272', 'CTUC'),
  intercooler(P, S, '3.0-272'),

  // === 8R Diesel engines ===
  engine(P, S, '2.0d-170', 'CAHA', 170, ['03L100036C']),
  starter(P, S, '2.0d-170'),
  alternator(P, S, '2.0d-170'),
  fuelPumpHP(P, S, '2.0d-170'),
  injectorsDiesel(P, S, '2.0d-170'),
  turbo(P, S, '2.0d-170', 'CAHA'),
  intercooler(P, S, '2.0d-170'),
  engine(P, S, '2.0d-177', 'CGLC', 177, ['CGLC']),
  starter(P, S, '2.0d-177'),
  alternator(P, S, '2.0d-177'),
  fuelPumpHP(P, S, '2.0d-177'),
  injectorsDiesel(P, S, '2.0d-177'),
  turbo(P, S, '2.0d-177', 'CGLC'),
  intercooler(P, S, '2.0d-177'),
  engine(P, S, '3.0d-240', 'CCWA', 240, ['CCWA']),
  starter(P, S, '3.0d-240'),
  alternator(P, S, '3.0d-240'),
  fuelPumpHP(P, S, '3.0d-240'),
  injectorsDiesel(P, S, '3.0d-240'),
  turbo(P, S, '3.0d-240', 'CCWA'),
  intercooler(P, S, '3.0d-240'),
  engine(P, S, '3.0d-245', 'CDUD', 245, ['CDUD']),
  starter(P, S, '3.0d-245'),
  alternator(P, S, '3.0d-245'),
  fuelPumpHP(P, S, '3.0d-245'),
  injectorsDiesel(P, S, '3.0d-245'),
  turbo(P, S, '3.0d-245', 'CDUD'),
  intercooler(P, S, '3.0d-245'),

  // === FY Petrol engines ===
  engine(P, S, '2.0-249', 'DAXB', 249, ['06L100032T']),
  starter(P, S, '2.0-249'),
  alternator(P, S, '2.0-249'),
  fuelPumpHP(P, S, '2.0-249'),
  turbo(P, S, '2.0-249', 'DAXB'),
  intercooler(P, S, '2.0-249'),

  // === FY Diesel engines ===
  engine(P, S, '2.0d-190', 'DETA', 190, ['DETA']),
  starter(P, S, '2.0d-190'),
  alternator(P, S, '2.0d-190'),
  fuelPumpHP(P, S, '2.0d-190'),
  injectorsDiesel(P, S, '2.0d-190'),
  turbo(P, S, '2.0d-190', 'DETA'),
  intercooler(P, S, '2.0d-190'),
  // === Transmissions ===
  transmission(P, S, 'mt', 'МКПП 6-ступ (0A6)', ['0A6']),
  transmission(P, S, 'robot', 'S-tronic 7-ступ (DL501)', ['0B5']),
  ecuTransmission(P, S, 'robot'),
  transmission(P, S, 'at', 'Tiptronic 8-ступ (ZF 8HP)', ['0BK']),
  ecuTransmission(P, S, 'at'),

  // === Drivetrain (AWD only) ===
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (8R) (2008-2017)',
    slug: '8r',
    yearStart: 2008,
    yearEnd: 2017,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-180', 'engine:2.0-211', 'engine:2.0-225', 'engine:2.0-230',
      'engine:3.2-270', 'engine:3.0-272',
      'engine:2.0d-170', 'engine:2.0d-177', 'engine:3.0d-240', 'engine:3.0d-245',
      'transmission:mt', 'transmission:robot', 'transmission:at',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (FY) (2016-2022)',
    slug: 'fy',
    yearStart: 2016,
    yearEnd: 2022,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0-249',
      'engine:2.0d-190',
      'transmission:robot', 'transmission:at',
      'drivetrain:awd',
    ],
  },
]

export const audiQ5Seed = {
  brand: {
    name: 'Audi',
    slug: 'audi',
    logo: 'M19.848,7.848c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928c-0.992,0-1.902,0.348-2.616,0.928c-0.714-0.58-1.624-0.928-2.616-0.928C1.859,7.848,0,9.707,0,12s1.859,4.152,4.152,4.152c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928c0.992,0,1.902-0.348,2.616-0.928c0.714,0.58,1.624,0.928,2.616,0.928C22.141,16.152,24,14.293,24,12S22.141,7.848,19.848,7.848z M17.232,13.866c-0.376-0.526-0.598-1.17-0.598-1.866c0-0.696,0.222-1.34,0.598-1.866c0.376,0.526,0.598,1.17,0.598,1.866C17.83,12.696,17.608,13.34,17.232,13.866z M12,13.866c-0.376-0.526-0.598-1.17-0.598-1.866c0-0.696,0.222-1.34,0.598-1.866c0.376,0.526,0.598,1.17,0.598,1.866C12.598,12.696,12.376,13.34,12,13.866z M6.768,13.866C6.392,13.34,6.17,12.696,6.17,12c0-0.696,0.222-1.34,0.598-1.866C7.144,10.66,7.366,11.304,7.366,12C7.366,12.696,7.144,13.34,6.768,13.866z M0.938,12c0-1.775,1.439-3.214,3.214-3.214c0.736,0,1.414,0.248,1.956,0.665C5.56,10.154,5.232,11.039,5.232,12c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C2.377,15.214,0.938,13.775,0.938,12z M7.428,14.549C7.976,13.846,8.304,12.961,8.304,12c0-0.961-0.328-1.846-0.876-2.549c0.542-0.416,1.22-0.665,1.956-0.665c0.736,0,1.414,0.248,1.956,0.665c-0.549,0.704-0.876,1.588-0.876,2.549c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C8.648,15.214,7.97,14.966,7.428,14.549z M12.66,14.549c0.549-0.704,0.876-1.588,0.876-2.549c0-0.961-0.328-1.846-0.876-2.55c0.542-0.416,1.22-0.665,1.956-0.665s1.414,0.248,1.956,0.665c-0.549,0.704-0.876,1.588-0.876,2.549c0,0.961,0.328,1.846,0.876,2.549c-0.542,0.416-1.22,0.665-1.956,0.665C13.88,15.214,13.202,14.966,12.66,14.549z M19.848,15.214c-0.736,0-1.414-0.248-1.956-0.665c0.548-0.704,0.876-1.588,0.876-2.549c0-0.961-0.328-1.846-0.876-2.549c0.542-0.416,1.22-0.665,1.956-0.665c1.775,0,3.214,1.439,3.214,3.214S21.623,15.214,19.848,15.214z',
    sortOrder: 2,
  },

  model: {
    name: 'Q5',
    slug: 'q5',
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
