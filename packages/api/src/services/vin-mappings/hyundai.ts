import type { VinBrandMapping } from './types'

export const hyundaiRuMapping: VinBrandMapping = {
  wmi: ['Z94'],
  brandSlug: 'hyundai',
  models: [
    {
      modelSlug: 'solaris',
      modelCodes: { position: [3, 4], codes: ['C'] },
      engineCodes: {
        position: 7,
        mapping: {
          C: ['engine:1.4-107'],
          D: ['engine:1.6-123'],
          '6': ['engine:1.6-123g'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          A: ['transmission:mt5', 'transmission:mt6'],
          B: ['transmission:at4', 'transmission:at6'],
        },
      },
    },
  ],
}

export const hyundaiKrMapping: VinBrandMapping = {
  wmi: ['KMH', 'NLH'],
  brandSlug: 'hyundai',
  models: [
    {
      modelSlug: 'solaris',
      modelCodes: { position: [3, 4], codes: ['C'] },
      engineCodes: {
        position: 7,
        mapping: {
          C: ['engine:1.4-107', 'engine:1.4-100'],
          D: ['engine:1.6-123', 'engine:1.6-123g'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          A: ['transmission:mt5', 'transmission:mt6'],
          B: ['transmission:at4', 'transmission:at6'],
        },
      },
    },
  ],
}
