import type { VinBrandMapping } from './types'

export const opelMapping: VinBrandMapping = {
  wmi: ['W0L'],
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
    },
  ],
}
