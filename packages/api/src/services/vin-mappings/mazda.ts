import type { VinBrandMapping } from './types'

export const mazdaMapping: VinBrandMapping = {
  wmi: ['JMZ', 'JM1'],
  brandSlug: 'mazda',
  models: [
    {
      modelSlug: 'mazda3',
      modelCodes: {
        position: [3, 5],
        codes: ['BK', 'BL', 'BM'],
      },
      generationCodes: {
        position: [3, 5],
        mapping: {
          BK: { slug: 'bk', bodyType: 'hatchback' },
          BL: { slug: 'bl', bodyType: 'hatchback' },
          BM: { slug: 'bm', bodyType: 'hatchback' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          F: ['engine:2.0-150'],
          G: ['engine:2.0-150'],
          '7': ['engine:2.0-150'],
          '8': ['engine:2.0-150'],
          P: ['engine:2.0-150'],
          '5': ['engine:2.5-192'],
          '6': ['engine:2.5-192'],
          D: ['engine:2.2d-150'],
        },
      },
    },
    {
      modelSlug: 'cx-5',
      modelCodes: {
        position: [3, 5],
        codes: ['KE', 'KF'],
      },
      generationCodes: {
        position: [3, 5],
        mapping: {
          KE: { slug: 'ke', bodyType: 'crossover' },
          KF: { slug: 'kf', bodyType: 'crossover' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          '7': ['engine:2.0-150'],
          '8': ['engine:2.0-150'],
          P: ['engine:2.0-150'],
          '5': ['engine:2.5-192'],
          '6': ['engine:2.5-192'],
          '9': ['engine:2.5-192'],
          D: ['engine:2.2d-175'],
        },
      },
    },
    {
      modelSlug: 'mazda6',
      modelCodes: {
        position: [3, 5],
        codes: ['GG', 'GY', 'GH', 'GW', 'GJ', 'GL'],
      },
      generationCodes: {
        position: [3, 5],
        mapping: {
          GG: { slug: 'gg', bodyType: 'sedan' },
          GY: { slug: 'gg', bodyType: 'wagon' },
          GH: { slug: 'gh', bodyType: 'sedan' },
          GW: { slug: 'gh', bodyType: 'wagon' },
          GJ: { slug: 'gj', bodyType: 'sedan' },
          GL: { slug: 'gj', bodyType: 'wagon' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          '1': ['engine:1.8-120'],
          F: ['engine:2.0-141', 'engine:2.0-147'],
          G: ['engine:2.0-141', 'engine:2.0-147'],
          '7': ['engine:2.0-150'],
          '8': ['engine:2.0-150'],
          P: ['engine:2.0-150'],
          '5': ['engine:2.5-170', 'engine:2.5-192'],
          '6': ['engine:2.5-170', 'engine:2.5-192'],
          '9': ['engine:2.5-192'],
          '3': ['engine:2.3-166'],
          '4': ['engine:2.3-166'],
        },
      },
    },
  ],
}
