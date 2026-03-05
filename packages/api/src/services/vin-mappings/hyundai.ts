import type { VinBrandMapping } from './types'

export const hyundaiRuMapping: VinBrandMapping = {
  wmi: ['Z94'],
  brandSlug: 'hyundai',
  models: [
    {
      modelSlug: 'solaris',
      modelCodes: { position: [3, 4], codes: ['K'] },
      engineCodes: {
        position: 7,
        mapping: {
          C: ['engine:1.6-123g', 'engine:1.6-123'],
          D: ['engine:1.4-100', 'engine:1.4-107'],
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
    {
      modelSlug: 'creta',
      modelCodes: { position: [3, 4], codes: ['G'] },
      engineCodes: {
        position: 6,
        mapping: {
          '1': ['engine:1.6-123'],
          '3': ['engine:2.0-149'],
        },
      },
      transmissionCodes: {
        position: 7,
        mapping: {
          A: ['transmission:mt6'],
          B: ['transmission:at6', 'transmission:cvt'],
          C: ['transmission:mt6'],
          D: ['transmission:at6', 'transmission:cvt'],
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
    {
      modelSlug: 'elantra',
      modelCodes: { position: [3, 4], codes: ['D'] },
      engineCodes: {
        position: 7,
        mapping: {
          C: ['engine:1.6-122', 'engine:1.6-128', 'engine:1.6-132'],
          D: ['engine:2.0-143', 'engine:2.0-150', 'engine:2.0-150l'],
          B: ['engine:1.8-150'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          A: ['transmission:mt6'],
          B: ['transmission:at4', 'transmission:at6'],
        },
      },
    },
  ],
}
