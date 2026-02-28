import { BodyType } from '@prisma/client'
import type { PartData, GenerationData, SharedPartRef } from './types'
import { getBaseParts } from './base-parts'
import { engine, starter, alternator, transmission, ecuTransmission, drivetrainFWD, drivetrainAWD, fuelPumpHP, turbo, intercooler } from './builders'

const P = 'lexus-rx300'
const S = ['lexus rx300', 'лексус рх300', 'лексус rx', 'rx300', 'рх300']

const modelSpecificParts: (PartData | SharedPartRef)[] = [
  engine(P, S, '3.0-200', '1MZ-FE V6', 200, ['1900020290']),
  starter(P, S, '3.0-200'),
  alternator(P, S, '3.0-200'),

  engine(P, S, '2.0t-238', '8AR-FTS', 238, ['1900036510']),
  starter(P, S, '2.0t-238'),
  alternator(P, S, '2.0t-238'),
  fuelPumpHP(P, S, '2.0t-238'),
  turbo(P, S, '2.0t-238', '8AR-FTS'),
  intercooler(P, S, '2.0t-238'),

  transmission(P, S, 'at4', 'АКПП 4-ступ A541E', ['3051048021']),
  ecuTransmission(P, S, 'at4'),
  transmission(P, S, 'at5', 'АКПП 5-ступ U151F', ['3050048150']),
  ecuTransmission(P, S, 'at5'),
  transmission(P, S, 'at6', 'АКПП 6-ступ U661E', ['3050048430']),
  ecuTransmission(P, S, 'at6'),

  ...drivetrainFWD(P, S),
  ...drivetrainAWD(P, S),
]

const generations: GenerationData[] = [
  {
    name: 'I (XU10) (1998-2003)',
    slug: 'xu10',
    yearStart: 1998,
    yearEnd: 2003,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.0-200',
      'transmission:at4',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
  {
    name: 'II (XU30) (2003-2006)',
    slug: 'xu30',
    yearStart: 2003,
    yearEnd: 2006,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:3.0-200',
      'transmission:at5',
      'drivetrain:awd',
    ],
  },
  {
    name: 'IV (AL20) (2017-2022)',
    slug: 'al20',
    yearStart: 2017,
    yearEnd: 2022,
    bodyType: 'crossover' as BodyType,
    isActive: true,
    availableConfigs: [
      'engine:2.0t-238',
      'transmission:at6',
      'drivetrain:fwd',
      'drivetrain:awd',
    ],
  },
]

export const lexusRx300Seed = {
  brand: {
    name: 'Lexus',
    slug: 'lexus',
    logo: 'M12.4815 5.0868C11.2248 6.5472 7.6404 11.2623 7.2319 11.8728C6.4455 13.0426 6.376 13.6094 6.3529 13.9871C6.3301 14.3578 6.3301 15.0263 6.9698 15.5713C8.0415 16.4722 9.5446 16.3267 10.8785 16.3267H21.8642C22.3345 16.3267 22.4734 16.1957 22.7279 15.8762C23.6066 14.6119 24 13.2387 24 12.0107C24 9.3805 22.1885 6.0677 17.6012 4.5709L17.0843 5.2683C20.723 6.8955 22.2268 9.0244 22.2268 12.0032C22.2499 12.8025 22.026 13.667 21.4708 14.4664H10.7854C10.1457 14.4664 10.0531 13.7834 10.2843 13.3982C11.2004 11.8617 12.2228 10.3837 13.3447 8.9737C14.4242 7.6151 15.4879 6.3435 16.6059 5.014C16.9066 4.6436 16.706 4.2874 16.1048 4.1713C14.8559 3.9243 13.5532 3.75 11.9726 3.75C3.2075 3.75 0 8.4942 0 12.0107C0 15.8253 3.2303 20.25 11.9958 20.25C16.8604 20.25 20.0446 18.7747 21.887 16.8786H20.0289C18.4174 18.2809 15.6496 19.2767 11.9958 19.2767C4.5716 19.2767 1.835 15.3457 1.835 11.9598C1.8887 8.9374 4.826 4.767 12.181 4.6291C12.4587 4.6218 12.6748 4.8616 12.4815 5.0868Z',
    sortOrder: 12,
  },

  model: {
    name: 'RX300',
    slug: 'rx300',
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
