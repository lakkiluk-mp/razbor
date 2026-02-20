import type { VinBrandMapping } from './types'

export const fordEuMapping: VinBrandMapping = {
  wmi: ['WF0', 'X9F'],
  brandSlug: 'ford',
  yearPosition: 10,
  models: [
    {
      modelSlug: 'focus',
      modelCodes: { position: [3, 4], codes: ['K'] },
      generationCodes: {
        position: [3, 4],
        mapping: {
          K: { slug: 'cb8', bodyType: 'hatchback' },
        },
      },
    },
    {
      modelSlug: 'focus',
      modelCodes: { position: [3, 4], codes: ['P', '4', 'H'] },
      generationCodes: {
        position: [3, 4],
        mapping: {
          P: { slug: 'cb4', bodyType: 'sedan' },
          '4': { slug: 'cb4', bodyType: 'hatchback' },
          H: { slug: 'cb4', bodyType: 'hatchback' },
        },
      },
    },
    {
      modelSlug: 'focus',
      modelCodes: { position: [3, 4], codes: ['3', 'D', 'W'] },
      generationCodes: {
        position: [3, 4],
        mapping: {
          '3': { slug: 'dfw', bodyType: 'hatchback' },
          D: { slug: 'dfw', bodyType: 'sedan' },
          W: { slug: 'dfw', bodyType: 'wagon' },
        },
      },
    },
    {
      modelSlug: 'focus',
    },
  ],
}

export const fordUsMapping: VinBrandMapping = {
  wmi: ['1FA', '3FA', '2FA'],
  brandSlug: 'ford',
  models: [
    {
      modelSlug: 'focus',
      modelCodes: { position: [3, 5], codes: ['DP', 'CP', 'BP', 'AP'] },
      engineCodes: {
        position: 6,
        mapping: {
          F: ['engine:2.0-150', 'engine:2.0-145'],
          D: ['engine:1.6-85', 'engine:1.6-105'],
          '8': ['engine:1.6-125'],
        },
      },
    },
  ],
}
