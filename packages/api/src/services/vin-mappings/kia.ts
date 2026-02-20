import type { VinBrandMapping } from './types'

export const kiaRuMapping: VinBrandMapping = {
  wmi: ['Z94'],
  brandSlug: 'kia',
  models: [
    {
      modelSlug: 'rio',
      modelCodes: { position: [3, 4], codes: ['C'] },
      generationCodes: {
        position: [3, 5],
        mapping: {
          CB: { slug: 'qb', bodyType: 'sedan' },
          CC: { slug: 'qb', bodyType: 'sedan' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          B: ['engine:1.6-123', 'engine:1.6-138'],
          A: ['engine:1.4-107'],
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

export const kiaMapping: VinBrandMapping = {
  wmi: ['KNA', 'KNC'],
  brandSlug: 'kia',
  models: [
    {
      modelSlug: 'rio',
      modelCodes: { position: [3, 5], codes: ['DC', 'DE', 'QB', 'FB', 'JB'] },
      generationCodes: {
        position: [3, 5],
        mapping: {
          DC: { slug: 'dc', bodyType: 'sedan' },
          JB: { slug: 'jb', bodyType: 'sedan' },
          DE: { slug: 'jb', bodyType: 'sedan' },
          QB: { slug: 'qb', bodyType: 'sedan' },
          FB: { slug: 'fb', bodyType: 'sedan' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          '3': ['engine:1.4-97', 'engine:1.4-107', 'engine:1.4-100'],
          '5': ['engine:1.6-112', 'engine:1.6-123', 'engine:1.6-123g'],
          '4': ['engine:1.5-95', 'engine:1.5-108'],
          '1': ['engine:1.3-84'],
          '6': ['engine:1.6-138'],
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
