import type { VinBrandMapping } from './types'

export const toyotaRuMapping: VinBrandMapping = {
  wmi: ['XW7'],
  brandSlug: 'toyota',
  skipYearParsing: true,
  models: [
    {
      modelSlug: 'camry',
      modelCodes: { position: [4, 5], codes: ['E'] },
      generationCodes: {
        position: [3, 4],
        mapping: {
          B: { slug: 'xv40', bodyType: 'sedan' },
        },
      },
      engineCodes: {
        position: 4,
        mapping: {
          E: ['engine:2.4-167'],
        },
      },
    },
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
    {
      modelSlug: 'corolla',
      engineCodes: {
        position: 4,
        mapping: {
          A: ['engine:1.6-124', 'engine:1.6-122'],
          R: ['engine:1.8-136', 'engine:1.8-140'],
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
    {
      modelSlug: 'corolla',
      engineCodes: {
        position: 4,
        mapping: {
          A: ['engine:1.6-124', 'engine:1.6-122'],
          R: ['engine:1.8-136', 'engine:1.8-140'],
        },
      },
    },
  ],
}
