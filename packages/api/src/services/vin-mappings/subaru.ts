import type { VinBrandMapping } from './types'

export const subaruMapping: VinBrandMapping = {
  wmi: ['JF1', 'JF2'],
  brandSlug: 'subaru',
  models: [
    {
      modelSlug: 'forester',
      modelCodes: { position: [3, 4], codes: ['S'] },
      generationCodes: {
        position: [4, 5],
        mapping: {
          F: { slug: 'sf', bodyType: 'crossover' },
          G: { slug: 'sg', bodyType: 'crossover' },
          H: { slug: 'sh', bodyType: 'crossover' },
          J: { slug: 'sj', bodyType: 'crossover' },
          K: { slug: 'sk', bodyType: 'crossover' },
        },
      },
      engineCodesRange: {
        position: [5, 6],
        mapping: {
          '5': ['engine:2.0-125', 'engine:2.0-158', 'engine:2.0-150'],
          '9': ['engine:2.5-172', 'engine:2.5-171'],
          'G': ['engine:2.0t-241'],
        },
      },
    },
    {
      modelSlug: 'impreza',
      modelCodes: { position: [3, 4], codes: ['G'] },
      generationCodes: {
        position: [4, 5],
        mapping: {
          D: { slug: 'gd', bodyType: 'sedan' },
          G: { slug: 'gd', bodyType: 'sedan' },
          E: { slug: 'ge', bodyType: 'sedan' },
          H: { slug: 'ge', bodyType: 'sedan' },
          J: { slug: 'gj', bodyType: 'sedan' },
          P: { slug: 'gj', bodyType: 'sedan' },
          K: { slug: 'gk', bodyType: 'sedan' },
          T: { slug: 'gk', bodyType: 'sedan' },
        },
      },
    },
  ],
}
