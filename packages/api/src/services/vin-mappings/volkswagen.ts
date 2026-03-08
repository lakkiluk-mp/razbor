import type { VinBrandMapping } from './types'

export const vwTiguanMapping: VinBrandMapping = {
  wmi: ['WVG'],
  brandSlug: 'volkswagen',
  models: [
    {
      modelSlug: 'tiguan',
      modelCodes: { position: [6, 8], codes: ['5N', 'AD'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          '5N': { slug: '5n', bodyType: 'crossover' },
          'AD': { slug: 'ad1', bodyType: 'crossover' },
        },
      },
    },
  ],
}

export const vwRuMapping: VinBrandMapping = {
  wmi: ['XW8'],
  brandSlug: 'volkswagen',
  models: [
    {
      modelSlug: 'polo',
      modelCodes: { position: [6, 8], codes: ['6R', '61', 'AW', 'BZ'] },
    },
  ],
}

export const vwDeMapping: VinBrandMapping = {
  wmi: ['WVW'],
  brandSlug: 'volkswagen',
  models: [
    {
      modelSlug: 'polo',
      modelCodes: { position: [6, 8], codes: ['6R', '61', 'AW', 'BZ'] },
    },
    {
      modelSlug: 'passat',
      modelCodes: { position: [6, 8], codes: ['3C', '36', '3G'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          '3C': { slug: 'b6', bodyType: 'sedan' },
          '36': { slug: 'b7', bodyType: 'sedan' },
          '3G': { slug: 'b8', bodyType: 'sedan' },
        },
      },
    },
    {
      modelSlug: 'golf',
      modelCodes: { position: [6, 8], codes: ['1J', '1K', '5K', '5G', 'AU'] },
      generationCodes: {
        position: [6, 8],
        mapping: {
          '1J': { slug: '1j', bodyType: 'hatchback' },
          '1K': { slug: '1k', bodyType: 'hatchback' },
          '5K': { slug: '5k', bodyType: 'hatchback' },
          '5G': { slug: '5g', bodyType: 'hatchback' },
          'AU': { slug: '5g', bodyType: 'hatchback' },
        },
      },
    },
  ],
}
