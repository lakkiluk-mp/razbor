import type { VinBrandMapping } from './types'

export const audiMapping: VinBrandMapping = {
  wmi: ['WAU', 'WUA', 'WA1'],
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
  ],
}
