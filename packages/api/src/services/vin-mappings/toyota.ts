import type { VinBrandMapping } from './types'

export const toyotaRuMapping: VinBrandMapping = {
  wmi: ['XW7'],
  brandSlug: 'toyota',
  skipYearParsing: true,
  models: [
    {
      modelSlug: 'camry',
      generationCodes: {
        position: [3, 4],
        mapping: {
          B: { slug: 'xv70', bodyType: 'sedan' },
          A: { slug: 'xv50', bodyType: 'sedan' },
        },
      },
      engineCodes: {
        position: 4,
        mapping: {
          F: ['engine:2.5-181', 'engine:2.5-200'],
          K: ['engine:3.5-249', 'engine:3.5-277'],
          D: ['engine:2.0-150-6ar', 'engine:2.0-150-m20a'],
          N: ['engine:2.0-150-6ar', 'engine:2.0-150-m20a'],
        },
      },
    },
  ],
}

export const toyotaJpMapping: VinBrandMapping = {
  wmi: ['JTD', 'JTE', '4T1', 'SB1'],
  brandSlug: 'toyota',
  models: [
    {
      modelSlug: 'camry',
      modelCodes: { position: [3, 4], codes: ['B'] },
      engineCodes: {
        position: 4,
        mapping: {
          F: ['engine:2.5-181', 'engine:2.5-200'],
          K: ['engine:3.5-249', 'engine:3.5-277'],
          D: ['engine:2.0-150-6ar', 'engine:2.0-150-m20a'],
          N: ['engine:2.5-181', 'engine:2.5-200'],
        },
      },
    },
  ],
}
