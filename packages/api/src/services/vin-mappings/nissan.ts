import type { VinBrandMapping } from './types'

export const nissanMapping: VinBrandMapping = {
  wmi: ['Z8N', 'SJN', 'JN1'],
  brandSlug: 'nissan',
  skipYearParsing: true,
  models: [
    {
      modelSlug: 'qashqai',
      modelCodes: { position: [3, 4], codes: ['F'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          J1: { slug: 'j10', bodyType: 'crossover' },
          J2: { slug: 'j11', bodyType: 'crossover' },
        },
      },
      engineCodes: {
        position: 4,
        mapping: {
          A: ['engine:1.6-114'],
          B: ['engine:2.0-141'],
        },
      },
    },
  ],
}
