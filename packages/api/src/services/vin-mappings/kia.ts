import type { VinBrandMapping } from './types'

export const kiaRuMapping: VinBrandMapping = {
  wmi: ['Z94'],
  brandSlug: 'kia',
  models: [
    {
      modelSlug: 'rio',
      modelCodes: { position: [3, 4], codes: ['C'] },
      generationCodes: {
        position: [3, 5],
        mapping: {
          CB: { slug: 'qb', bodyType: 'sedan' },
          CC: { slug: 'qb', bodyType: 'sedan' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          B: ['engine:1.6-123', 'engine:1.6-138'],
          A: ['engine:1.4-107'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          A: ['transmission:mt5', 'transmission:mt6'],
          B: ['transmission:at4', 'transmission:at6'],
        },
      },
    },
  ],
}

export const kiaEuMapping: VinBrandMapping = {
  wmi: ['U5Y'],
  brandSlug: 'kia',
  models: [
    {
      modelSlug: 'ceed',
      modelCodes: { position: [3, 4], codes: ['H'] },
      engineCodes: {
        position: 6,
        mapping: {
          '1': ['engine:1.4-109', 'engine:1.4-100'],
          '2': ['engine:1.6-122', 'engine:1.6-130'],
          '3': ['engine:1.6-135'],
          '4': ['engine:1.6t-204'],
          '6': ['engine:1.6-130'],
          C: ['engine:1.4t-140', 'engine:1.5t-150'],
        },
      },
      transmissionCodes: {
        position: 7,
        mapping: {
          A: ['transmission:mt5', 'transmission:mt6'],
          B: ['transmission:at4', 'transmission:at6'],
          G: ['transmission:robot6', 'transmission:robot7'],
        },
      },
    },
  ],
}

export const kiaMapping: VinBrandMapping = {
  wmi: ['KNA', 'KNC'],
  brandSlug: 'kia',
  models: [
    {
      modelSlug: 'rio',
      modelCodes: { position: [3, 5], codes: ['DC', 'DE', 'QB', 'FB', 'JB'] },
      generationCodes: {
        position: [3, 5],
        mapping: {
          DC: { slug: 'dc', bodyType: 'sedan' },
          JB: { slug: 'jb', bodyType: 'sedan' },
          DE: { slug: 'jb', bodyType: 'sedan' },
          QB: { slug: 'qb', bodyType: 'sedan' },
          FB: { slug: 'fb', bodyType: 'sedan' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          '3': ['engine:1.4-97', 'engine:1.4-107', 'engine:1.4-100'],
          '5': ['engine:1.6-112', 'engine:1.6-123', 'engine:1.6-123g'],
          '4': ['engine:1.5-95', 'engine:1.5-108'],
          '1': ['engine:1.3-84'],
          '6': ['engine:1.6-138'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          A: ['transmission:mt5', 'transmission:mt6'],
          B: ['transmission:at4', 'transmission:at6'],
        },
      },
    },
    {
      modelSlug: 'sportage',
      modelCodes: { position: [3, 5], codes: ['PE', 'PH', 'PA'] },
      generationCodes: {
        position: [3, 5],
        mapping: {
          PE: { slug: 'sl', bodyType: 'crossover' },
          PH: { slug: 'ql', bodyType: 'crossover' },
          PA: { slug: 'nq5', bodyType: 'crossover' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          B: ['engine:2.0-150', 'engine:2.0-150n', 'engine:2.0-150l'],
          C: ['engine:1.6t-177'],
          D: ['engine:2.4-176', 'engine:2.4-184'],
          F: ['engine:2.5-190'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          A: ['transmission:mt6'],
          B: ['transmission:at6', 'transmission:at8'],
          C: ['transmission:robot'],
        },
      },
    },
    {
      modelSlug: 'ceed',
      modelCodes: { position: [3, 5], codes: ['FF', 'HB', 'HC', 'HM', 'HN'] },
      generationCodes: {
        position: [3, 5],
        mapping: {
          FF: { slug: 'ed', bodyType: 'hatchback' },
          HB: { slug: 'ed', bodyType: 'hatchback' },
          HC: { slug: 'ed-wagon', bodyType: 'wagon' },
          HM: { slug: 'jd', bodyType: 'hatchback' },
          HN: { slug: 'jd-wagon', bodyType: 'wagon' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          '1': ['engine:1.4-109', 'engine:1.4-100'],
          '2': ['engine:1.6-122', 'engine:1.6-130'],
          '3': ['engine:2.0-143', 'engine:1.6-135'],
          '4': ['engine:1.6t-204'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          A: ['transmission:mt5', 'transmission:mt6'],
          B: ['transmission:at4', 'transmission:at6'],
          G: ['transmission:robot6', 'transmission:robot7'],
        },
      },
    },
    {
      modelSlug: 'optima',
      modelCodes: { position: [3, 5], codes: ['TF', 'JF'] },
      generationCodes: {
        position: [3, 5],
        mapping: {
          TF: { slug: 'tf', bodyType: 'sedan' },
          JF: { slug: 'jf', bodyType: 'sedan' },
        },
      },
      engineCodes: {
        position: 7,
        mapping: {
          B: ['engine:2.0-150', 'engine:2.0-150g'],
          D: ['engine:2.4-180', 'engine:2.4-188'],
          C: ['engine:2.0t-245'],
        },
      },
      transmissionCodes: {
        position: 8,
        mapping: {
          A: ['transmission:mt6'],
          B: ['transmission:at6'],
        },
      },
    },
  ],
}
