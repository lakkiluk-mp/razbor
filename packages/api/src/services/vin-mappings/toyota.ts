import type { VinBrandMapping } from './types'

export const toyotaLcMapping: VinBrandMapping = {
  wmi: ['JTM'],
  brandSlug: 'toyota',
  models: [
    {
      modelSlug: 'land-cruiser',
      modelCodes: { position: [3, 4], codes: ['H'] },
      generationCodes: {
        position: [3, 4],
        mapping: {
          H: { slug: 'j200', bodyType: 'suv' },
        },
      },
      engineCodes: {
        position: 6,
        mapping: {
          B: ['engine:4.7-288'],
          F: ['engine:4.5d-235', 'engine:4.5d-249'],
          G: ['engine:4.6-309'],
        },
      },
    },
    {
      modelSlug: 'land-cruiser-prado',
      modelCodes: { position: [3, 4], codes: ['V', 'K'] },
      generationCodes: {
        position: [3, 4],
        mapping: {
          V: { slug: 'j150', bodyType: 'suv' },
          K: { slug: 'j150', bodyType: 'suv' },
        },
      },
      engineCodes: {
        position: 6,
        mapping: {
          R: ['engine:2.7-163'],
          D: ['engine:2.8d-177', 'engine:3.0d-173'],
          G: ['engine:4.0-249', 'engine:4.0-282'],
        },
      },
    },
  ],
}

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
    {
      modelSlug: 'rav4',
      engineCodes: {
        position: 4,
        mapping: {
          D: ['engine:2.0-149'],
          F: ['engine:2.5-199', 'engine:2.5-180'],
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
    {
      modelSlug: 'rav4',
      engineCodes: {
        position: 4,
        mapping: {
          D: ['engine:2.0-149'],
          F: ['engine:2.5-199', 'engine:2.5-180'],
          R: ['engine:2.0-152', 'engine:2.0-146'],
        },
      },
    },
  ],
}
