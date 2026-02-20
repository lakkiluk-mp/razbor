import type { VinBrandMapping } from './types'

export const opelMapping: VinBrandMapping = {
  wmi: ['W0L', 'XUF', 'XWF'],
  brandSlug: 'opel',
  models: [
    {
      modelSlug: 'astra',
      modelCodes: { position: [3, 4], codes: ['A', 'P', '0'] },
      generationCodes: {
        position: [3, 4],
        mapping: {
          '0': { slug: 'h', bodyType: 'hatchback' },
          A: { slug: 'h', bodyType: 'hatchback' },
          P: { slug: 'j', bodyType: 'hatchback' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          '4': ['engine:1.4-90', 'engine:1.4-100'],
          '6': ['engine:1.6-115z', 'engine:1.6-115'],
          '8': ['engine:1.8-140'],
          J: ['engine:1.4t-140'],
        },
      },
    },
  ],
}
