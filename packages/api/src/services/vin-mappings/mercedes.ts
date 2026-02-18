import type { VinBrandMapping } from './types'

export const mercedesOldMapping: VinBrandMapping = {
  wmi: ['WDB'],
  brandSlug: 'mercedes-benz',
  models: [
    {
      modelSlug: 'c-class',
      modelCodes: { position: [4, 6], codes: ['HA', 'RF', 'GF', 'HF', 'WF', 'AF'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          HA: { slug: 'w202', bodyType: 'sedan' },
          RF: { slug: 'w203', bodyType: 'sedan' },
          GF: { slug: 'w204', bodyType: 'sedan' },
          HF: { slug: 'w204', bodyType: 'wagon' },
          WF: { slug: 'w205', bodyType: 'sedan' },
          AF: { slug: 'w206', bodyType: 'sedan' },
        },
      },
      transmissionCodes: {
        position: 7,
        mapping: {
          '0': ['transmission:mt'],
          '1': ['transmission:at'],
          '2': ['transmission:at'],
        },
      },
    },
    {
      modelSlug: 's-class',
      modelCodes: { position: [4, 6], codes: ['GA', 'NG', 'BG'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          GA: { slug: 'w140', bodyType: 'sedan' },
          NG: { slug: 'w220', bodyType: 'sedan' },
          BG: { slug: 'w221', bodyType: 'sedan' },
        },
      },
      transmissionCodes: {
        position: 7,
        mapping: {
          '0': ['transmission:mt'],
          '1': ['transmission:at'],
          '2': ['transmission:at'],
        },
      },
    },
  ],
}

export const mercedesNewMapping: VinBrandMapping = {
  wmi: ['WDD', 'WDC', 'W1K', 'W1N'],
  brandSlug: 'mercedes-benz',
  skipYearParsing: true,
  models: [
    {
      modelSlug: 'c-class',
      modelCodes: { position: [3, 6], codes: ['204', '205', '206'] },
      generationCodes: {
        position: [3, 6],
        mapping: {
          '204': { slug: 'w204', bodyType: 'sedan' },
          '205': { slug: 'w205', bodyType: 'sedan' },
          '206': { slug: 'w206', bodyType: 'sedan' },
        },
      },
      variantCodes: {
        position: [6, 9],
        mapping: {
          '008': { engines: ['engine:2.5-204'], transmissions: ['transmission:at7'], drivetrains: ['drivetrain:rwd'] },
          '009': { engines: ['engine:3.0-231'], transmissions: ['transmission:at7'], drivetrains: ['drivetrain:rwd'] },
          '031': { engines: ['engine:1.6-156'], transmissions: ['transmission:at7'], drivetrains: ['drivetrain:rwd'] },
          '035': { engines: ['engine:1.8-156'], transmissions: ['transmission:at7'], drivetrains: ['drivetrain:rwd'] },
          '041': { engines: ['engine:1.8-184'], transmissions: ['transmission:at7'], drivetrains: ['drivetrain:rwd'] },
          '048': { engines: ['engine:1.8-184'], transmissions: ['transmission:at7'], drivetrains: ['drivetrain:awd'] },
          '054': { engines: ['engine:3.5-272'], transmissions: ['transmission:at7'], drivetrains: ['drivetrain:rwd'] },
          '057': { engines: ['engine:1.8-204'], transmissions: ['transmission:at7'], drivetrains: ['drivetrain:rwd'] },
          '072': { engines: ['engine:3.5-272'], transmissions: ['transmission:at7'], drivetrains: ['drivetrain:awd'] },
          '077': { engines: ['engine:6.2-457'], transmissions: ['transmission:at7'], drivetrains: ['drivetrain:rwd'] },
          '082': { engines: ['engine:1.8-156'], transmissions: ['transmission:mt6'], drivetrains: ['drivetrain:rwd'] },
          '083': { engines: ['engine:1.8-184'], transmissions: ['transmission:mt6'], drivetrains: ['drivetrain:rwd'] },
          '084': { engines: ['engine:1.8-204'], transmissions: ['transmission:mt6'], drivetrains: ['drivetrain:rwd'] },
        },
      },
    },
    {
      modelSlug: 's-class',
      modelCodes: { position: [3, 6], codes: ['220', '221'] },
      generationCodes: {
        position: [3, 6],
        mapping: {
          '220': { slug: 'w220', bodyType: 'sedan' },
          '221': { slug: 'w221', bodyType: 'sedan' },
        },
      },
    },
  ],
}
