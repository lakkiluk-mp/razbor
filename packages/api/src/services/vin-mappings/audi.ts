import type { VinBrandMapping } from './types'

export const audiEuMapping: VinBrandMapping = {
  wmi: ['WAU', 'WUA'],
  brandSlug: 'audi',
  models: [
    {
      modelSlug: 'q5',
      modelCodes: { position: [6, 8], codes: ['8R', 'FY'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          '8R': { slug: '8r', bodyType: 'crossover' },
          FY: { slug: 'fy', bodyType: 'crossover' },
        },
      },
    },
    {
      modelSlug: 'a3',
      modelCodes: { position: [6, 8], codes: ['8V', '8Y'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          '8V': { slug: '8v-sportback', bodyType: 'hatchback' },
          '8Y': { slug: '8y-sportback', bodyType: 'hatchback' },
        },
      },
    },
    {
      modelSlug: 'a6',
      modelCodes: { position: [6, 8], codes: ['4F', '4G', '4K'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          '4F': { slug: '4f', bodyType: 'sedan' },
          '4G': { slug: '4g', bodyType: 'sedan' },
          '4K': { slug: '4k', bodyType: 'sedan' },
        },
      },
    },
  ],
}

export const audiUsMapping: VinBrandMapping = {
  wmi: ['WA1'],
  brandSlug: 'audi',
  models: [
    {
      modelSlug: 'q5',
      modelCodes: { position: [6, 8], codes: ['FP', 'FY'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          FY: { slug: 'fy', bodyType: 'crossover' },
        },
      },
      engineCodes: {
        position: 4,
        mapping: {
          K: ['engine:3.2-270'],
          F: ['engine:2.0-211', 'engine:2.0-225', 'engine:2.0-230'],
          G: ['engine:3.0-272'],
          M: ['engine:3.0d-240', 'engine:3.0d-245'],
          N: ['engine:2.0-249'],
          A: ['engine:2.0-249'],
          B: ['engine:2.0-249'],
        },
      },
    },
  ],
}
