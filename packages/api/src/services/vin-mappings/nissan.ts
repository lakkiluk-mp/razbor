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
    {
      modelSlug: 'x-trail',
      modelCodes: { position: [3, 4], codes: ['T'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          T0: { slug: 't30', bodyType: 'crossover' },
          T1: { slug: 't31', bodyType: 'crossover' },
          T2: { slug: 't32', bodyType: 'crossover' },
        },
      },
      engineCodes: {
        position: 4,
        mapping: {
          A: ['engine:2.0-140', 'engine:2.0-141', 'engine:2.0-144'],
          B: ['engine:2.5-165', 'engine:2.5-169', 'engine:2.5-171'],
        },
      },
    },
    {
      modelSlug: 'almera',
      modelCodes: { position: [3, 4], codes: ['L'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          G0: { slug: 'g15', bodyType: 'sedan' },
        },
      },
      engineCodes: {
        position: 4,
        mapping: {
          A: ['engine:1.6-102'],
        },
      },
    },
  ],
}
