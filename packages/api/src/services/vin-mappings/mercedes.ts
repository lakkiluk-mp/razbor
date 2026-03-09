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
      modelSlug: 'e-class',
      modelCodes: { position: [4, 6], codes: ['FA', 'JA', 'JF'] },
      generationCodes: {
        position: [4, 6],
        mapping: {
          FA: { slug: 'w211', bodyType: 'sedan' },
          JA: { slug: 'w212', bodyType: 'sedan' },
          JF: { slug: 'w213', bodyType: 'sedan' },
        },
      },
    },
    {
      modelSlug: 's-class',
      modelCodes: { position: [3, 6], codes: ['140', '220', '221'] },
      generationCodes: {
        position: [3, 6],
        mapping: {
          '140': { slug: 'w140', bodyType: 'sedan' },
          '220': { slug: 'w220', bodyType: 'sedan' },
          '221': { slug: 'w221', bodyType: 'sedan' },
        },
      },
      variantCodes: {
        position: [6, 9],
        mapping: {
          '065': { engines: ['engine:3.2-224'] },
          '067': { engines: ['engine:3.7-245'] },
          '070': { engines: ['engine:4.3-279'] },
          '170': { engines: ['engine:4.3-279'] },
          '075': { engines: ['engine:5.0-306'] },
          '175': { engines: ['engine:5.0-306'] },
        },
      },
    },
  ],
}

export const mercedesSuvMapping: VinBrandMapping = {
  wmi: ['WDC'],
  brandSlug: 'mercedes-benz',
  skipYearParsing: true,
  models: [
    {
      modelSlug: 'm-class',
      modelCodes: { position: [3, 6], codes: ['163', '164', '166'] },
      generationCodes: {
        position: [3, 6],
        mapping: {
          '163': { slug: 'w163', bodyType: 'suv' },
          '164': { slug: 'w164', bodyType: 'suv' },
          '166': { slug: 'w166', bodyType: 'suv' },
        },
      },
    },
    {
      modelSlug: 'g-class',
      modelCodes: { position: [3, 6], codes: ['463'] },
      generationCodes: {
        position: [3, 6],
        mapping: {
          '463': { slug: 'w463', bodyType: 'suv' },
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
      modelSlug: 'e-class',
      modelCodes: { position: [3, 6], codes: ['211', '212', '213'] },
      generationCodes: {
        position: [3, 6],
        mapping: {
          '211': { slug: 'w211', bodyType: 'sedan' },
          '212': { slug: 'w212', bodyType: 'sedan' },
          '213': { slug: 'w213', bodyType: 'sedan' },
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
      variantCodes: {
        position: [6, 9],
        mapping: {
          '065': { engines: ['engine:3.2-224'] },
          '067': { engines: ['engine:3.7-245'] },
          '070': { engines: ['engine:4.3-279', 'engine:4.7-340'] },
          '170': { engines: ['engine:4.3-279', 'engine:4.7-340'] },
          '075': { engines: ['engine:5.0-306'] },
          '175': { engines: ['engine:5.0-306'] },
          '056': { engines: ['engine:3.5-272'] },
          '156': { engines: ['engine:3.5-272'] },
          '082': { engines: ['engine:3.5-306'] },
          '071': { engines: ['engine:5.5-388'] },
          '186': { engines: ['engine:5.5-388'] },
          '073': { engines: ['engine:4.7-435'] },
          '173': { engines: ['engine:4.7-435'] },
        },
      },
    },
  ],
}
